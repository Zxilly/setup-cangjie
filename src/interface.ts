export interface FileRoot {
  type: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  html_url: string;
  download_url: string;
  _links: Links;
}

export interface Links {
  self: string;
  html: string;
}

export interface TreeRoot {
  tree: Tree[];
}

export interface Tree {
  sha: string;
  name: string;
  type: string;
  path: string;
  mode: string;
  md5: string;
}

export interface BlobRoot {
  sha: string;
  size: number;
  url: string;
  content: string;
  encoding: string;
}

export interface UserRoot {
  avatar_url: string | null;
  events_url: string | null;
  followers_url: string | null;
  following_url: string | null;
  gists_url: string | null;
  html_url: string;
  id: string;
  login: string;
  member_role: string | null;
  name: string;
  organizations_url: string | null;
  received_events_url: string | null;
  remark: string | null;
  repos_url: string | null;
  starred_url: string | null;
  subscriptions_url: string | null;
  type: string;
  url: string | null;
  bio: string;
  blog: string;
  company: string;
  created_at: string | null;
  email: string;
  followers: number;
  following: number;
  profession: string | null;
  public_gists: string | null;
  public_repos: string | null;
  qq: string | null;
  stared: string | null;
  updated_at: string | null;
  watched: string | null;
  wechat: string | null;
  weibo: string | null;
}

export interface GitLFSResponseRoot {
  transfer: string;
  objects: LFSObject[];
  username: string;
}

export interface LFSObject {
  oid: string;
  size: number;
  actions: Actions;
}

export interface Actions {
  download: Download;
}

export interface Download {
  href: string;
  header: Record<string, string>;
  expires_at: string;
  expires_in: number;
}

export interface Tag {
  name: string;
  message: string;
  commit: Commit;
  tagger: Tagger;
}

export interface Commit {
  sha: string;
  date: string;
}

export interface Tagger {
  name: string;
  email: string;
  date: string;
}

export type TagRoot = Tag[];
