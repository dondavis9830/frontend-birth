# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Birthday video wishes

The intro offers two separately password-protected destinations: Amritha Ma’am’s birthday experience and the video-wish submission page. Passwords are checked by the backend. Approved submissions appear in a randomized, one-at-a-time autoplay sequence on the birthday page. Birthday messages scroll horizontally with GSAP and pause when hovered or focused. Admins can sign in at `/admin` to review pending submissions and delete any pending or approved video.

For local backend setup, MongoDB and Cloudinary configuration, and deployment instructions, see [`../server/README.md`](../server/README.md).

Run the frontend with `npm install` and `npm run dev`. The Vite development server proxies API requests to `http://localhost:4000`. For a separately hosted API, set `VITE_API_BASE_URL` to the API origin before building.

If the admin page reports that an API route was not found (HTTP 404), confirm the frontend is pointed at the intended backend (`VITE_API_BASE_URL`, if set), then restart the backend from the `server` folder with `npm run dev` so the latest admin routes are loaded.
