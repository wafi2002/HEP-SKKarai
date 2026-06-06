# Docker Setup — HEP SKKarai

## Prerequisite

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah install dan running

---

## Cara Run

### 1. Clone / buka folder project

```bash
cd HEP-SKKarai
```

### 2. First time (build image dulu)

```bash
docker-compose up --build
```

### 3. Lepas tu (tanpa rebuild)

```bash
docker-compose up
```

### 4. Stop semua services

```bash
docker-compose down
```

> Nak delete database sekali (reset data):
> ```bash
> docker-compose down -v
> ```

---

## Services & URL

| Service    | URL                     | Keterangan              |
|------------|-------------------------|-------------------------|
| Frontend   | http://localhost:3000   | Nuxt.js app             |
| Backend    | http://localhost:4000   | NestJS API              |
| pgAdmin    | http://localhost:5050   | GUI database manager    |
| PostgreSQL | localhost:5432          | Database (internal)     |

---

## Login pgAdmin

1. Buka http://localhost:5050
2. Login dengan:
   - **Email:** `admin@admin.com`
   - **Password:** `admin`

### Connect pgAdmin ke Database

1. Klik **Add New Server**
2. Tab **General** — Name: `HEP SKKarai` (nama ikut suka)
3. Tab **Connection** — isi:
   - **Host:** `postgres`
   - **Port:** `5432`
   - **Username:** `postgres`
   - **Password:** `postgres`
4. Klik **Save**

> **Penting:** Host mesti `postgres` (nama Docker service), bukan `localhost`

---

## Environment Variables

### Backend

| Variable      | Value           |
|---------------|-----------------|
| APP_PORT      | 4000            |
| DB_HOST       | postgres        |
| DB_PORT       | 5432            |
| DB_USERNAME   | postgres        |
| DB_PASSWORD   | postgres        |
| DB_DATABASE   | hep_skkarai     |
| JWT_SECRET    | hep-skkarai-2026|

### Frontend

| Variable              | Value                   |
|-----------------------|-------------------------|
| NUXT_PUBLIC_API_BASE  | http://localhost:4000   |

---

## Troubleshooting

**Backend tak start sebab DB belum ready**
```bash
docker-compose restart backend
```

**Port already in use**

Pastikan tiada app lain guna port 3000, 4000, 5050, atau 5432. Stop dulu kalau ada:
```bash
docker-compose down
```

**Nak tengok logs sesuatu service**
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

**Nak masuk dalam container**
```bash
docker exec -it hep-backend sh
docker exec -it hep-frontend sh
```
