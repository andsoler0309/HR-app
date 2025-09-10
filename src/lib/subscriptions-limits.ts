import { SupabaseClient } from '@supabase/supabase-js';

type ResourceLimit = {
  tableName: string;
  freeLimit: number;
  paidLimit: number;
  errorMessage: (limit: number) => string;
  companyIdField?: string;
};

type ResourceConfig = {
  employees?: boolean;
  documents?: boolean;
  departments?: boolean;
  templates?: boolean;
};

export class SubscriptionLimitError extends Error {
  public readonly canUpgrade: boolean;
  public readonly currentCount: number;
  public readonly limit: number;
  public readonly resourceType: string;

  constructor(
    message: string, 
    canUpgrade: boolean, 
    currentCount: number, 
    limit: number, 
    resourceType: string
  ) {
    super(message);
    this.name = 'SubscriptionLimitError';
    this.canUpgrade = canUpgrade;
    this.currentCount = currentCount;
    this.limit = limit;
    this.resourceType = resourceType;
  }
}

export async function checkResourceLimits(
  supabase: SupabaseClient,
  resourcesToCheck: ResourceConfig,
  isEditing = false
): Promise<void> {
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  // Check subscription status
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle(); // Use maybeSingle() instead of single() to handle zero rows

  // If there's no subscription record, user is on free plan
  // If there's an error other than "no rows", handle it
  if (subscriptionError && subscriptionError.code !== 'PGRST116') {
    console.error('Error checking subscription:', subscriptionError);
  }

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Define resource limits
  const resourceLimits: Record<string, ResourceLimit> = {
    employees: {
      tableName: 'employees',
      freeLimit: 3,
      paidLimit: 50,
      errorMessage: (limit: number) => 
        `You've reached your limit of ${limit} employee${limit === 1 ? '' : 's'} on the free plan.`,
      companyIdField: 'company_id'
    },
    documents: {
      tableName: 'documents',
      freeLimit: 2,
      paidLimit: 100,
      errorMessage: (limit: number) => 
        `You've reached your limit of ${limit} document${limit === 1 ? '' : 's'} on the free plan.`,
      companyIdField: 'company_id'
    },
    departments: {
      tableName: 'departments',
      freeLimit: 1,
      paidLimit: 20,
      errorMessage: (limit: number) => 
        `You've reached your limit of ${limit} department${limit === 1 ? '' : 's'} on the free plan.`,
      companyIdField: 'company_id'
    },
    templates: {
      tableName: 'document_templates',
      freeLimit: 1,
      paidLimit: 30,
      errorMessage: (limit: number) => 
        `You've reached your limit of ${limit} template${limit === 1 ? '' : 's'} on the free plan.`,
      companyIdField: 'company_id'
    }
  };

  // Only check resources that were requested
  for (const [resourceName, shouldCheck] of Object.entries(resourcesToCheck)) {
    if (!shouldCheck) continue;

    const resourceConfig = resourceLimits[resourceName];
    if (!resourceConfig) continue;

    const currentLimit = isSubscribed ? resourceConfig.paidLimit : resourceConfig.freeLimit;

    if (!isEditing) {
      const { count } = await supabase
        .from(resourceConfig.tableName)
        .select('*', { count: 'exact' })
        .eq(resourceConfig.companyIdField || 'company_id', user.id);

      // If we're at or above the limit, throw a detailed error
      if (count && count >= currentLimit) {
        const errorMessage = resourceConfig.errorMessage(currentLimit);
        
        throw new SubscriptionLimitError(
          errorMessage,
          !isSubscribed, // Can upgrade if not subscribed
          count,
          currentLimit,
          resourceName
        );
      }
    }
  }
}