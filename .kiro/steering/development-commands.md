# Development Commands

## Important: Running Development Server

When testing the application with `npm run dev`, ALWAYS use the `&` flag at the end to run it in the background:

```bash
npm run dev &
```

This prevents the command from blocking and allows continued development work. Without the `&`, the terminal will hang and prevent further operations.

## Other Development Commands

- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio &` - Open Prisma Studio in background
- `npx prisma generate` - Generate Prisma client after schema changes