'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuth() {
  useEffect(() => {
    const debugAuth = async () => {
      console.log('=== AUTH DEBUG START ===');
      
      try {
        // Check session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('Session data:', sessionData);
        console.log('Session error:', sessionError);
        
        // Check user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        console.log('User data:', userData);
        console.log('User error:', userError);
        
        if (userData.user) {
          // Check if profile exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single();
          
          console.log('Profile data:', profileData);
          console.log('Profile error:', profileError);
          
          // Check profiles table structure
          const { data: tableInfo, error: tableError } = await supabase
            .from('profiles')
            .select('*')
            .limit(0);
          
          console.log('Table structure check error:', tableError);
        }
        
      } catch (error) {
        console.error('Debug error:', error);
      }
      
      console.log('=== AUTH DEBUG END ===');
    };
    
    debugAuth();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-1">Debug Mode</div>
      <div>Check console for auth debugging info</div>
    </div>
  );
}
