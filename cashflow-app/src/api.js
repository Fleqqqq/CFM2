import { supabase } from './supabase.js';

export const api = {
  async login(email, password) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const user = {
      id: authData.user.id,
      name: authData.user.user_metadata?.name || email.split('@')[0],
      email: authData.user.email,
      isPremium: authData.user.app_metadata?.is_premium || false,
    };

    return { user, token: authData.session.access_token };
  },

  async signup(email, password) {
    const { data: authData, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
      throw new Error('An account with this email already exists.');
    }
    const user = {
      id: authData.user.id,
      name: email.split('@')[0],
      email,
      isPremium: false
    };
    return { user, token: authData.session?.access_token };
  },

  async upgradeToPremium(email) {
    return { name: email.split('@')[0], email, isPremium: true };
  },

  async getProjects(user) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_email', user.email);
    if (error) {
      console.error('getProjects error:', error);
      return [];
    }
    const projects = data.map(p => JSON.parse(p.data));
    console.log('Loaded projects:', projects);
    return projects;
  },

  async saveProjects(user, projects) {
    await supabase.from('projects').delete().eq('user_email', user.email);
    for (const project of projects) {
      const { error } = await supabase.from('projects').insert({
        project_id: project.id,
        user_email: user.email,
        data: JSON.stringify(project)
      });
      if (error) console.error('Save error:', error);
    }
  },

  async deleteAccount(email) {
    // 1. Delete user data
    const { error: dataError } = await supabase.from('projects').delete().eq('user_email', email);
    if (dataError) throw new Error(dataError.message);

    // 2. Delete user auth account via RPC
    const { error: rpcError } = await supabase.rpc('delete_user');
    if (rpcError) {
      console.error("RPC delete_user failed. You likely still need to run the SQL query from your Supabase Dashboard to enable full Auth deletion.", rpcError);
    }
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://rahanto.fi/reset-password'
    });
    if (error) throw new Error(error.message);
  },
};