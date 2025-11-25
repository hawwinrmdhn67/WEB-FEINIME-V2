# ✨ Feinime V2 - Web Anime Modern 

[![Next.js](https://skillicons.dev/icons?i=nextjs)](https://skillicons.dev)
[![React](https://skillicons.dev/icons?i=react)](https://skillicons.dev)
[![TypeScript](https://skillicons.dev/icons?i=typescript)](https://skillicons.dev)
[![TailwindCSS](https://skillicons.dev/icons?i=tailwindcss)](https://skillicons.dev)

Feinime V2 adalah platform website anime modern yang dirancang untuk menampilkan data anime secara *real-time* dengan pengalaman pengguna yang mulus. Dibangun di atas *stack* teknologi modern **Next.js**, **React**, dan **TailwindCSS (ShadCN UI)** untuk performa dan *scalability* terbaik.

<img src="public/feinime.jpg" alt="Feinime Logo" style="width:200px;"/>

Preview website bisa cek dibawah :

https://web-feinimev-2-uishadcn.vercel.app/

---

## 🚀 Fitur Unggulan

Feinime V2 dilengkapi dengan fitur-fitur yang memaksimalkan navigasi dan *user experience*:

* **Live Search Interaktif:**

    * **Desktop:** Hasil pencarian muncul sebagai **dropdown** di bawah *input field* secara *live*.

    * **Mobile:** Mengaktifkan mode **fullscreen** untuk fokus pencarian yang maksimal.

* **Dark Mode** 🌙: Toggle tema terang/gelap yang mudah diakses di *navbar*.

* **Responsif Penuh**: Tata letak dioptimalkan untuk perangkat *desktop*, *tablet*, dan *mobile*.

* **Halaman Lengkap**: Mencakup navigasi ke **Home**, **Trending**, **Seasonal**, **Popular**, **Genres**, dan **Search**.

* **Optimasi Performa**: Menggunakan **`lodash.debounce`** pada input pencarian untuk membatasi *request* API berlebihan.

* **Pengalaman Loading Halus**: Menggunakan **Skeleton Loader** saat menunggu respons API.

---

## 🛠️ Tech Stack

| **Framework** | **Next.js 13+** | Framework React Production-ready (menggunakan App Router). |

| **UI Library** | **React 18** | Komponen UI dan state management. |

| **Styling** | **TailwindCSS** | Utility-first CSS framework untuk *rapid development*. |

| **Component** | **ShadCN UI** | Kumpulan komponen UI berbasis Tailwind dan Radix UI. |

| **Bahasa** | **TypeScript** | Memastikan ketahanan kode dan tipe yang aman. |

| **HTTP Client** | **Axios** | Digunakan untuk fetching data dari API anime (e.g., Jikan API). |

| **Utilities** | **Lodash.debounce** | Mengoptimalkan performa input search. |

| **Ikon** | **Lucide React** | Koleksi ikon yang ringan dan modern. |

---

## 📸 Screenshots

### Home Page

<img width="1440" height="813" alt="image" src="https://github.com/user-attachments/assets/219fbf12-2f59-48fd-bb30-93a2d996172b" />

---

### Season Now

<img width="1440" height="814" alt="image" src="https://github.com/user-attachments/assets/464d040e-b37d-42e2-870e-c037367ac9d3" />

---

### All Time Popular

<img width="1440" height="813" alt="image" src="https://github.com/user-attachments/assets/2bb4e70d-262e-4bdd-9d55-adcb60171099" />

---

## ⚙️ Instalasi & Setup Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek Feinime V2 di lingkungan lokal Anda.

### 1. Clone Repository

```bash

git clone [https://github.com/hawwinrmdhn67/WEB-FEINIMEV2-UISHADCN.git](https://github.com/hawwinrmdhn67/WEB-FEINIMEV2-UISHADCN.git)

cd WEB-FEINIMEV2-UISHADCN

````

### 2\. Install Dependencies

Install semua paket yang dibutuhkan:

```bash

npm install

```

> **Catatan:** Jika Anda mengalami error versi React, coba install ulang dengan spesifik: `npm install react@18 react-dom@18`.

### 3\. Install Utilities Tambahan

```bash

npm install lodash.debounce axios

npm install --save-dev @types/lodash.debounce @types/react

npm install react-hot-toast

npm install framer-motion

npm install next-themes

```

### 4\. Jalankan Development Server

```bash

npm run dev

```

Aplikasi akan berjalan di: **[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)**.

-----

## 📂 Struktur Project

```

WEB-FEINIMEV2-UISHADCN/

├─ app/                  # Direktori utama untuk routing dan halaman
│  ├─ [anime-id]/        # Rute dinamis untuk halaman detail anime
│  ├─ trending/          # Halaman Trending Anime
│  ├─ seasonal/          # Halaman Seasonal Anime
│  ├─ popular/           # Halaman Popular Anime
│  └─ layout.tsx         # Layout global dan root dari aplikasi
├─ components/           # Komponen UI yang dapat digunakan kembali (Navbar, AnimeCard, ThemeToggle, dll.)
├─ lib/                  # Fungsi utilitas dan layer API (searchAnime, api.ts)
├─ public/               # Assets statis (gambar, font, logo)
├─ styles/               # Global CSS dan konfigurasi Tailwind
├─ package.json          # Metadata proyek dan daftar dependensi
└─ tsconfig.json         # Konfigurasi TypeScript

```
-----

## 👨‍💻 Cara Penggunaan

Proyek ini dirancang untuk navigasi yang intuitif, didukung oleh fitur live search yang efisien:

1.  **Navigasi Utama:** Gunakan **Navbar** untuk berpindah antar halaman utama (**Home, Trending, Seasonal, Popular, Genres**).

2.  **Live Search (Desktop):** Mulai ketik di search bar yang tersedia di navbar. Hasil pencarian akan langsung muncul sebagai **dropdown**. Tekan **Enter** atau klik tombol **"View all results"** untuk navigasi ke halaman pencarian penuh.

3.  **Live Search (Mobile/Tablet):** Klik ikon **Search (🔍)** di navbar. Ini akan membuka mode **fullscreen search** untuk pengalaman mengetik yang fokus di perangkat kecil.

4.  **Detail Anime:** Klik pada *card* anime mana pun (di Home, Trending, atau hasil pencarian) untuk melihat halaman detailnya.

-----

## 🤝 Kontribusi

Kontribusi Anda sangat dihargai\! Jika Anda ingin menambahkan fitur, memperbaiki *bug*, atau meningkatkan performa:

1.  *Fork* repository ini.

2.  Buat *branch* fitur baru: `git checkout -b fitur-xyz`

3.  *Commit* perubahan mu: `git commit -m "feat: Menambahkan fitur xyz"`

4.  *Push* ke *branch*: `git push origin fitur-xyz`

5.  Buka **Pull Request** ke *main branch* di repository ini.
   
-----

## 📝 Catatan Untuk Yang mau ambil repository untuk bahan project 


  * **API Fethching**: Seluruh data anime diambil menggunakan **Axios** dari API anime (e.g., Jikan API). Pastikan *endpoint* di file `lib/api.ts` sudah benar.

  * **Debouncing**: Penggunaan `lodash.debounce` adalah kunci untuk optimasi performa *live search*.


*Terima kasih telah melihat project Feinime V2 Salam dari dev hawwinrmdhn67\!*

----
