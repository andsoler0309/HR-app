import { NextRequest, NextResponse } from 'next/server';
import { 
  cleanupExpiredPendingSubscriptions, 
  cleanupOldPendingSubscriptions, 
  checkExpiredSubscriptions 
} from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a cron job or authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Running subscription cleanup job...');

    // Clean up expired pending subscriptions (older than 10 minutes - our activation window)
    const expiredPending = await cleanupOldPendingSubscriptions();
    console.log(`Cleaned up ${expiredPending?.length || 0} expired pending subscriptions`);

    // Clean up very old pending subscriptions (older than 1 hour as backup)
    const veryExpiredPending = await cleanupExpiredPendingSubscriptions();
    console.log(`Cleaned up ${veryExpiredPending?.length || 0} very old pending subscriptions`);

    // Clean up expired active subscriptions
    const expiredActive = await checkExpiredSubscriptions();
    console.log(`Processed ${expiredActive?.length || 0} expired active subscriptions`);

    return NextResponse.json({
      success: true,
      cleaned: {
        expiredPending: expiredPending?.length || 0,
        veryExpiredPending: veryExpiredPending?.length || 0,
        expiredActive: expiredActive?.length || 0
      }
    });
  } catch (error) {
    console.error('Error in subscription cleanup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow GET for health check
export async function GET() {
  return NextResponse.json({ status: 'Subscription cleanup endpoint active' });
}
