# Deployment Guide

This guide covers deploying the API Key Manager to various platforms with proper environment configuration.

## Environment Configuration

### Development Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Configure your local environment:
```bash
# .env.local
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-jwt-secret-key-not-for-production"
ADMIN_PASSWORD="admin123"
SERVICE_API_KEY="dev-service-key-12345"
NODE_ENV="development"
```

3. Set up the database:
```bash
npm run db:setup
```

### Production Deployment

## Heroku Deployment

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:mini
```

3. Set environment variables:
```bash
heroku config:set JWT_SECRET="$(openssl rand -base64 32)"
heroku config:set ADMIN_PASSWORD="your-secure-admin-password"
heroku config:set SERVICE_API_KEY="$(openssl rand -base64 32)"
heroku config:set NODE_ENV="production"
```

4. Deploy:
```bash
git push heroku main
```

5. Run database setup:
```bash
heroku run npm run db:setup:prod
```

## Railway Deployment

1. Connect your GitHub repository to Railway
2. Add PostgreSQL database service
3. Set environment variables in Railway dashboard:
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - `ADMIN_PASSWORD`: Your secure admin password
   - `SERVICE_API_KEY`: Generate with `openssl rand -base64 32`
   - `NODE_ENV`: `production`
4. Deploy automatically via GitHub integration
5. Run database setup via Railway CLI:
```bash
railway run npm run db:setup:prod
```

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add a PostgreSQL database (Neon, PlanetScale, etc.)
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`
   - `ADMIN_PASSWORD`: Your secure admin password
   - `SERVICE_API_KEY`: Generate with `openssl rand -base64 32`
   - `NODE_ENV`: `production`
4. Deploy automatically via GitHub integration

## Docker Deployment

1. Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/apikeys
      - JWT_SECRET=your-secure-jwt-secret
      - ADMIN_PASSWORD=your-secure-admin-password
      - SERVICE_API_KEY=your-secure-service-api-key
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=apikeys
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Build and run:
```bash
docker-compose up -d
```

3. Run database setup:
```bash
docker-compose exec app npm run db:setup:prod
```

## Environment Variable Security

### Generating Secure Values

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Service API Key
openssl rand -base64 32

# Admin Password (use a password manager)
# Should be complex and unique
```

### Security Checklist

- [ ] Use strong, unique values for all secrets
- [ ] Never commit actual secrets to version control
- [ ] Use environment-specific configuration files
- [ ] Rotate secrets regularly in production
- [ ] Use HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Enable database connection encryption

## Database Migration

### From SQLite to PostgreSQL

1. Export data from SQLite (if needed):
```bash
npm run db:studio
# Export data manually or use Prisma's data migration tools
```

2. Update `DATABASE_URL` to PostgreSQL connection string

3. Run database setup:
```bash
npm run db:setup:prod
```

4. Import data (if needed):
```bash
# Use Prisma Studio or custom migration scripts
```

## Monitoring and Maintenance

### Health Checks

The application provides basic health check endpoints:
- `GET /api/health` - Application health status
- Database connectivity is verified on startup

### Logs

- Application logs are written to stdout/stderr
- Use platform-specific log aggregation (Heroku logs, Railway logs, etc.)
- Monitor for authentication failures and API validation errors

### Backup

- Set up regular database backups via your hosting platform
- Export API key data periodically for disaster recovery
- Test backup restoration procedures

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` format
   - Check database server accessibility
   - Ensure database exists and user has permissions

2. **Authentication Issues**
   - Verify `JWT_SECRET` is set and consistent
   - Check `ADMIN_PASSWORD` configuration
   - Ensure cookies are working (HTTPS in production)

3. **API Validation Failures**
   - Verify `SERVICE_API_KEY` configuration
   - Check request headers and authentication
   - Monitor for key expiration or revocation

### Debug Commands

```bash
# Check environment configuration
node -e "console.log(process.env)"

# Test database connection
npm run db:studio

# Verify Prisma schema
npx prisma validate

# Check application health
curl http://localhost:3000/api/health
```