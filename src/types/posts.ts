/**
 * @file Types of the community feed: a post and its comments (CR-25).
 *
 * Moved out of store/postsSlice.ts after the architecture conformance check
 * (reflexion model) found that services/postsApi.ts imported them from the
 * store: a service must not depend on the store. Now both depend on types/.
 */

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
  /** True when the post exists only in this browser. */
  _local?: boolean;
}
