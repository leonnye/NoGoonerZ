import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { CommunityPost } from '@/types/streak';
import { supabase } from '@/lib/supabase';

type PostRow = {
  id: string;
  author: string;
  content: string;
  streak: number;
  likes: number;
  created_at: string;
};

export const [CommunityProvider, useCommunity] = createContextHook(() => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const mapRow = (row: PostRow): CommunityPost => ({
      id: row.id,
      author: row.author,
      content: row.content,
      streak: row.streak,
      likes: row.likes,
      isLiked: false,
      timestamp: row.created_at,
    });

    const load = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, author, content, streak, likes, created_at')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        console.log('Error loading posts from Supabase:', error.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        setPosts(data.map(mapRow));
      }
      setIsLoading(false);
    };

    load();

    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as PostRow;
          setPosts((current) => [mapRow(row), ...current]);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const row = payload.new as PostRow;
          setPosts((current) =>
            current.map((p) =>
              p.id === row.id ? { ...p, likes: row.likes } : p,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const addPost = useCallback(
    async (author: string, content: string, streak: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user, cannot add post');
        return;
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        author,
        content,
        streak,
      });

      if (error) {
        console.log('Error inserting post:', error.message);
      }
      // The realtime subscription will add the new post into state
    },
    [],
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      setPosts((current) => {
        const target = current.find((p) => p.id === postId);
        if (!target) return current;

        const isLiked = !target.isLiked;
        const likes = isLiked ? target.likes + 1 : Math.max(0, target.likes - 1);

        // optimistic update
        const next = current.map((p) =>
          p.id === postId ? { ...p, isLiked, likes } : p,
        );

        supabase
          .from('posts')
          .update({ likes })
          .eq('id', postId)
          .then(({ error }) => {
            if (error) {
              console.log('Error updating likes:', error.message);
            }
          });

        return next;
      });
    },
    [],
  );

  return {
    posts,
    isLoading,
    addPost,
    toggleLike,
  };
});
