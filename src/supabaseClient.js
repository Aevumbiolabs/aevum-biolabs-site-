import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmwvpnernabayhctjnuj.supabase.co';
const supabaseKey = 'sb_publishable_mfGIe38wr_O8i4vG_Tt87A_Xi-GdO7P';

export const supabase = createClient(supabaseUrl, supabaseKey);