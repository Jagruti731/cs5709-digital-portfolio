import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CommentItem {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface PostItem {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  image?: string | null;
  comments?: CommentItem[];
  likedBy?: string[];
  _local?: boolean;
}

interface PostsState {
  items: PostItem[];
}

const initialState: PostsState = {
  items: [],
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts(state, action: PayloadAction<PostItem[]>) {
      state.items = action.payload;
    },
    addPost(state, action: PayloadAction<PostItem>) {
      state.items = [action.payload, ...state.items];
    },
    updatePost(state, action: PayloadAction<PostItem>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      else state.items = [action.payload, ...state.items];
    },
    addComment(state, action: PayloadAction<{ postId: string; comment: CommentItem }>) {
      const { postId, comment } = action.payload;
      const p = state.items.find((x) => x.id === postId);
      if (p) {
        p.comments = p.comments || [];
        p.comments.push(comment);
      }
    },
    toggleLike(state, action: PayloadAction<{ postId: string; author: string }>) {
      // A like always has an author; the starter pushed the string 'anon'.
      const { postId, author } = action.payload;
      const p = state.items.find((x) => x.id === postId);
      if (!p) return;
      p.likedBy = p.likedBy || [];
      const i = p.likedBy.indexOf(author);
      if (i === -1) p.likedBy.push(author);
      else p.likedBy.splice(i, 1);
    },
  },
});

export const { setPosts, addPost, updatePost, addComment, toggleLike } = postsSlice.actions;
export default postsSlice.reducer;
