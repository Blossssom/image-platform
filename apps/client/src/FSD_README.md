# Feature-Sliced Design (FSD) Structure

This project follows the Feature-Sliced Design methodology.
https://feature-sliced.design/

## Layers

- **`app/`**: App-wide settings, styles, and providers. In Next.js App Router, this also handles **Routing**.
- **`views/`**: (Equivalent to FSD `pages`) Page components that compose widgets, features, and entities. We use `views` instead of `pages` to avoid conflict with Next.js Pages Router.

## Next.js App Router Integration Pattern
In FSD, the `app/` directory should remain **"thin"**.
It handles **Routing**, **Metadata**, and **Data Fetching (Server Components)**, but delegates the UI logic to `views/`.

### Example
**`app/gallery/page.tsx` (Route Handler)**
```tsx
import { GalleryPage } from '@/views/gallery';

export const metadata = { title: 'Gallery' };

export default function Page() {
  return <GalleryPage />;
}
```

**`src/views/gallery/ui/GalleryPage.tsx` (Actual Page UI)**
```tsx
import { ImageList } from '@/widgets/image-list';

export const GalleryPage = () => {
    return (
        <main>
           <h1>Gallery</h1>
           <ImageList />
        </main>
    );
};
```
- **`widgets/`**: Compositional units that combine features and entities (e.g., Header, PostCard, Sidebar).
- **`features/`**: User interactions that bring business value (e.g., AuthByEmail, LikePost, ImageSearch).
- **`entities/`**: Business domain entities (e.g., User, Image, Comment).
- **`shared/`**: Reusable infrastructure code (UI kit, libs, API clients) that is not specific to the business domain.

## Access Rules (Slices)
- Lower layers cannot import from higher layers.
- `shared` -> `entities` -> `features` -> `widgets` -> `views` -> `app`
