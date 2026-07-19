# Graph Report - .  (2026-07-07)

## Corpus Check
- Corpus is ~48,776 words - fits in a single context window. You may not need a graph.

## Summary
- 605 nodes · 1291 edges · 30 communities (27 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.66)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Merchandise Storage|Merchandise Storage]]
- [[_COMMUNITY_Inquiry Notifications|Inquiry Notifications]]
- [[_COMMUNITY_Merchandise Receipts|Merchandise Receipts]]
- [[_COMMUNITY_Admin API Routes|Admin API Routes]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Express Server|Express Server]]
- [[_COMMUNITY_Admin Authentication|Admin Authentication]]
- [[_COMMUNITY_Admin Dashboard UI|Admin Dashboard UI]]
- [[_COMMUNITY_Connect Page UI|Connect Page UI]]
- [[_COMMUNITY_Static Site Content|Static Site Content]]
- [[_COMMUNITY_Content Normalization|Content Normalization]]
- [[_COMMUNITY_Inquiry Persistence|Inquiry Persistence]]
- [[_COMMUNITY_Content Types|Content Types]]
- [[_COMMUNITY_Site Content API|Site Content API]]
- [[_COMMUNITY_Client TS Config|Client TS Config]]
- [[_COMMUNITY_App Navigation UI|App Navigation UI]]
- [[_COMMUNITY_Server TS Config|Server TS Config]]
- [[_COMMUNITY_Vercel TS Config|Vercel TS Config]]
- [[_COMMUNITY_Home Causes UI|Home Causes UI]]
- [[_COMMUNITY_Connect Normalizers|Connect Normalizers]]
- [[_COMMUNITY_Album Gallery|Album Gallery]]
- [[_COMMUNITY_Vite App Entry|Vite App Entry]]
- [[_COMMUNITY_Donation Dialogs|Donation Dialogs]]
- [[_COMMUNITY_Vercel Routing|Vercel Routing]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]

## God Nodes (most connected - your core abstractions)
1. `normalizeSiteContent()` - 26 edges
2. `isAdminSessionValid()` - 20 edges
3. `unauthorizedResponse()` - 19 edges
4. `compilerOptions` - 17 edges
5. `AdminSiteContentPage()` - 15 edges
6. `compilerOptions` - 14 edges
7. `compilerOptions` - 13 edges
8. `sendInquiryNotification()` - 12 edges
9. `sendMerchandiseReceiptNotification()` - 12 edges
10. `POST()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Merchandise Reservations` --implements--> `POST()`  [EXTRACTED]
  README.md → api/merchandise/orders.ts
- `Hidden Admin Editor Flow` --implements--> `GET()`  [EXTRACTED]
  README.md → api/admin/inquiries.ts
- `Hidden Admin Editor Flow` --implements--> `POST()`  [EXTRACTED]
  README.md → api/admin/login.ts
- `Inquiry Email Delivery` --references--> `POST()`  [EXTRACTED]
  README.md → api/inquiries/index.ts
- `Public Inquiry Flow` --implements--> `POST()`  [EXTRACTED]
  README.md → api/inquiries/index.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Public Inquiry Flow** — readme_public_inquiry_flow, api_inquiries_index_post, server_lib_inquiryvalidation_validateinquirypayload, server_lib_inquirystore_createinquiry, database_readme_public_inquiries [INFERRED 0.85]
- **Admin Content Flow** — readme_admin_editor_flow, api_admin_login_post, api_admin_inquiries_get, api_site_content_put, server_lib_adminauth_createadminsessioncookie [INFERRED 0.85]

## Communities (30 total, 3 thin omitted)

### Community 0 - "Merchandise Storage"
Cohesion: 0.06
Nodes (59): bundleAvailableQuantity(), CancellationResult, cancelSupabaseReservation(), createLocalReservation(), createSupabaseReservation(), defaultStoragePath, ensureLocalStorage(), expandReservationItemsToComponents() (+51 more)

### Community 1 - "Inquiry Notifications"
Cohesion: 0.06
Nodes (49): inquirySubmitRateLimit, POST(), readPayload(), Row Level Security, Inquiry Email Delivery, Vercel Serverless API, defaultFinanceRecipients, defaultGeneralRecipients (+41 more)

### Community 2 - "Merchandise Receipts"
Cohesion: 0.08
Nodes (53): merchandiseReservationRateLimit, POST(), readPayload(), applyRateLimit(), approximateTextWidth(), buildMerchandiseReceiptPdf(), buildPdfDocument(), defaultAdminRecipients (+45 more)

### Community 3 - "Admin API Routes"
Cohesion: 0.11
Nodes (36): isAdminSessionValid(), GET(), DELETE(), GET(), POST(), DELETE(), GET(), GET() (+28 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.06
Nodes (34): dependencies, cors, dotenv, express, nodemailer, react, react-dom, devDependencies (+26 more)

### Community 5 - "Express Server"
Cohesion: 0.12
Nodes (26): Express API, app, clientDistPath, devCorsOrigins, inquirySubmitRateLimit, loginRateLimit, merchandiseReservationRateLimit, port (+18 more)

### Community 6 - "Admin Authentication"
Cohesion: 0.17
Nodes (22): AdminSession, base64UrlDecode(), base64UrlEncode(), clearAdminSessionCookie(), createAdminSessionCookie(), createCookieValue(), createSessionToken(), getAdminAuthConfigurationError() (+14 more)

### Community 7 - "Admin Dashboard UI"
Cohesion: 0.13
Nodes (25): AdminMerchandiseInventoryResponse, AdminMerchandiseInventoryRow, AdminMerchandiseOrder, AdminMerchandiseOrderItem, AdminMerchandiseOrdersResponse, AdminSiteContentPage(), AdminSiteContentPageProps, albumFallback() (+17 more)

### Community 8 - "Connect Page UI"
Cohesion: 0.15
Nodes (21): airportWebsiteHref(), airportWebsiteLinks, attractionPreviewLinks, attractionPreviewUrl(), ConnectDialogType, ConnectPage(), ConnectPageProps, promoCodeFromLabel() (+13 more)

### Community 9 - "Static Site Content"
Cohesion: 0.08
Nodes (23): albumCategories, causeCards, connectMoments, connectPlaceholders, contactChannels, defaultConnectPageContent, donationInfo, donationRoutes (+15 more)

### Community 10 - "Content Normalization"
Cohesion: 0.15
Nodes (23): defaultCausesCopy, defaultConnectCopy, defaultDonateCopy, defaultHomeCopy, makeAlbumKey(), normalizeAlbum(), normalizeCause(), normalizeCausesCopy() (+15 more)

### Community 11 - "Inquiry Persistence"
Cohesion: 0.16
Nodes (21): DELETE(), getInquiryIdFromRequest(), InquiryActionPayload, PATCH(), Database or Hosted Store, Local JSON Persistence, createInquiry(), defaultStoragePath (+13 more)

### Community 12 - "Content Types"
Cohesion: 0.09
Nodes (22): AlbumCategoryId, CauseCard, CausesPageCopy, ConnectMerchandiseContent, ConnectPageContent, ConnectPageCopy, ConnectPricingGroup, ConnectScheduleItem (+14 more)

### Community 13 - "Site Content API"
Cohesion: 0.15
Nodes (17): GET(), PUT(), Database Setup, public.inquiries_export View, Inquiries SQL Schema, public.inquiries Table, Hidden Admin Editor Flow, Donor and Alumni Experience (+9 more)

### Community 14 - "Client TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+10 more)

### Community 15 - "App Navigation UI"
Cohesion: 0.15
Nodes (12): Hash-based Tab Navigation, App(), connectRegistrationHashes, storeHashes, handleRovingTabKeyDown(), AlbumDialog(), LightboxDialog(), LightboxDialogProps (+4 more)

### Community 16 - "Server TS Config"
Cohesion: 0.12
Nodes (15): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir, resolveJsonModule (+7 more)

### Community 17 - "Vercel TS Config"
Cohesion: 0.13
Nodes (14): compilerOptions, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, noEmit (+6 more)

### Community 18 - "Home Causes UI"
Cohesion: 0.21
Nodes (9): CausesPage(), CausesPageProps, HomePage(), HomePageProps, InlineEditableText(), InlineEditableTextProps, renderInlineFormatting(), RichTextDisplay() (+1 more)

### Community 19 - "Connect Normalizers"
Cohesion: 0.31
Nodes (9): normalizeConnectPageContent(), normalizeMerchandiseContent(), normalizePricingGroup(), normalizeScheduleItem(), normalizeSponsorEntry(), normalizeSponsorPageTier(), normalizeStayContent(), normalizeStringArray() (+1 more)

### Community 20 - "Album Gallery"
Cohesion: 0.38
Nodes (5): AlbumDialogProps, PastEventsDialogProps, AlbumFolder, EventAlbum, GalleryImage

### Community 21 - "Vite App Entry"
Cohesion: 0.33
Nodes (5): Root Mount Element, Vite HTML Entry Point, JAANA Website Project, Single-page React TypeScript Site, Vite Frontend

### Community 22 - "Donation Dialogs"
Cohesion: 0.40
Nodes (4): CauseDialog(), CauseDialogProps, PlaceholderDonateButton(), PlaceholderDonateButtonProps

### Community 23 - "Vercel Routing"
Cohesion: 0.33
Nodes (5): buildCommand, framework, outputDirectory, rewrites, $schema

## Knowledge Gaps
- **192 isolated node(s):** `AdminSession`, `InquiryActionPayload`, `loginRateLimit`, `inquirySubmitRateLimit`, `merchandiseReservationRateLimit` (+187 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `normalizeSiteContent()` connect `Content Normalization` to `Connect Normalizers`, `Admin Dashboard UI`, `Site Content API`, `App Navigation UI`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `validateInquiryPayload()` connect `Inquiry Notifications` to `Express Server`, `Site Content API`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `writeSiteContent()` connect `Site Content API` to `Content Normalization`, `Express Server`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `AdminSession`, `InquiryActionPayload`, `loginRateLimit` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Merchandise Storage` be split into smaller, more focused modules?**
  _Cohesion score 0.058173076923076925 - nodes in this community are weakly interconnected._
- **Should `Inquiry Notifications` be split into smaller, more focused modules?**
  _Cohesion score 0.058445353594389245 - nodes in this community are weakly interconnected._
- **Should `Merchandise Receipts` be split into smaller, more focused modules?**
  _Cohesion score 0.08246753246753247 - nodes in this community are weakly interconnected._