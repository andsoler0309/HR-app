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

export async function checkResourceLimits(
  supabase: SupabaseClient,
  resourcesToCheck: ResourceConfig,
  isEditing = false
): Promise<void> {
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  // Check subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .single();

  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Define resource limits
  const resourceLimits: Record<string, ResourceLimit> = {
    employees: {
      tableName: 'employees',
      freeLimit: 1,
      paidLimit: 50,
      errorMessage: (limit: number) => 
        `Limited to ${limit} employee${limit === 1 ? '' : 's'}. ${!isSubscribed ? 'Please upgrade to premium.' : ''}`,
      companyIdField: 'company_id'
    },
    documents: {
      tableName: 'documents',
      freeLimit: 2,
      paidLimit: 100,
      errorMessage: (limit: number) => 
        `Limited to ${limit} document${limit === 1 ? '' : 's'}. ${!isSubscribed ? 'Please upgrade to premium.' : ''}`,
      companyIdField: 'company_id'
    },
    departments: {
      tableName: 'departments',
      freeLimit: 1,
      paidLimit: 20,
      errorMessage: (limit: number) => 
        `Limited to ${limit} department${limit === 1 ? '' : 's'}. ${!isSubscribed ? 'Please upgrade to premium.' : ''}`,
      companyIdField: 'company_id'
    },
    templates: {
      tableName: 'document_templates',
      freeLimit: 1,
      paidLimit: 30,
      errorMessage: (limit: number) => 
        `Limited to ${limit} template${limit === 1 ? '' : 's'}. ${!isSubscribed ? 'Please upgrade to premium.' : ''}`,
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

      // If we're at or above the limit, throw an error
      if (count && count >= currentLimit) {
        throw new Error(resourceConfig.errorMessage(currentLimit));
      }
    }
  }
}