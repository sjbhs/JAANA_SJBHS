export type TabId = "home" | "causes" | "donate" | "connect";

export type InquiryForm = {
  name: string;
  email: string;
  organization: string;
  interest: string;
  notes: string;
};

export type TabConfig = {
  id: TabId;
  label: string;
  kicker: string;
  title: string;
  copy: string;
};

export type PriorityCard = {
  title: string;
  body: string;
  points: string[];
  cta: string;
  tab: TabId;
};

export type CauseCard = {
  title: string;
  summary: string;
  minimum: string;
  purpose: string;
  goal: string;
  impact: string;
  support: string[];
  donationWays: string[];
};

export type ContactChannel = {
  label: string;
  value: string;
  href: string;
};

export type SponsorTier = {
  title: string;
  amount: string;
  benefits: string[];
};

export type EventHighlight = {
  title: string;
  body: string;
};

export type SecondaryPage = {
  title: string;
  body: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

export type AlbumCategoryId = "oba" | "christmas" | "connect" | "sports" | "school";

export type EventAlbum = {
  title: string;
  category: AlbumCategoryId;
  label: string;
  summary: string;
  cover: GalleryImage;
  photos: GalleryImage[];
};

export type AlbumFolder = {
  id: AlbumCategoryId;
  title: string;
  description: string;
  albums: EventAlbum[];
};

export type HouseShield = {
  src: string;
  alt: string;
};
