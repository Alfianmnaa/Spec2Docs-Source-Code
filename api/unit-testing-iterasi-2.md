# Unit Testing Iterasi 2 — Core Documentation Engine (Non-AI)

Dokumen ini berisi seluruh skenario unit testing pada Iterasi 2 dalam format tabel markdown, mencakup pengujian parser AST, folder scanner, mapper OpenAPI, quality scoring, serta controller generator.

---

## 1️⃣ Unit Testing Modul Parser (AST Engine)

| ID   | Nama Pengujian            | Tujuan                                       | Input                   | Ekspektasi                |
| ---- | ------------------------- | -------------------------------------------- | ----------------------- | ------------------------- |
| P-01 | Parsing File Valid        | Memastikan parser membaca file backend valid | File Express 1 endpoint | AST terbentuk tanpa error |
| P-02 | Parsing Multiple Endpoint | Menguji parsing banyak endpoint              | File dengan 3 endpoint  | Semua endpoint terdeteksi |
| P-03 | Parsing HTTP Method       | Validasi deteksi method                      | GET, POST, DELETE       | Method terbaca benar      |
| P-04 | Parsing Path Dinamis      | Validasi path parameter                      | `/users/:id`            | Path tidak hilang         |
| P-05 | File Kosong               | Ketahanan parser                             | File kosong             | Tidak crash               |
| P-06 | Syntax Error Handling     | Handling sintaks salah                       | File error syntax       | Error ditangani aman      |

---

## 2️⃣ Unit Testing Folder Scanner

| ID   | Nama Pengujian     | Tujuan                    | Input             | Ekspektasi           |
| ---- | ------------------ | ------------------------- | ----------------- | -------------------- |
| F-01 | Scan Single File   | Scan 1 file API           | Folder 1 file     | File terdeteksi      |
| F-02 | Scan Multiple File | Scan banyak file          | Folder multi file | Semua file terbaca   |
| F-03 | Nested Folder Scan | Scan folder bertingkat    | Folder nested     | File tetap ditemukan |
| F-04 | Ignore Non-JS File | Filter file tidak relevan | Ada .txt/.json    | Hanya JS diproses    |
| F-05 | Empty Folder       | Folder kosong             | Folder tanpa file | Return array kosong  |

---

## 3️⃣ Unit Testing Mapper OpenAPI

| ID   | Nama Pengujian   | Tujuan                  | Input               | Ekspektasi               |
| ---- | ---------------- | ----------------------- | ------------------- | ------------------------ |
| M-01 | Struktur OpenAPI | Validasi struktur dasar | Data endpoint valid | Ada openapi, info, paths |
| M-02 | Mapping Paths    | Validasi mapping path   | 2 endpoint          | Paths sesuai             |
| M-03 | Mapping Methods  | Validasi mapping method | GET + POST          | Method sesuai            |
| M-04 | JSON Validity    | Validasi format JSON    | Output generator    | JSON valid               |
| M-05 | Empty Endpoint   | Handling kosong         | Tanpa endpoint      | Paths kosong             |

---

## 4️⃣ Unit Testing Quality Scoring

| ID   | Nama Pengujian      | Tujuan                | Input              | Ekspektasi     |
| ---- | ------------------- | --------------------- | ------------------ | -------------- |
| Q-01 | Dokumentasi Lengkap | Skor tinggi           | Metadata lengkap   | Skor tinggi    |
| Q-02 | Dokumentasi Minim   | Skor rendah           | Tanpa deskripsi    | Skor rendah    |
| Q-03 | Tanpa Endpoint      | Handling nol endpoint | Dokumentasi kosong | Skor minimum   |
| Q-04 | Validasi Rentang    | Validasi batas skor   | Semua skenario     | 0–100 valid    |
| Q-05 | Konsistensi Skor    | Stabilitas algoritma  | Input sama         | Skor konsisten |

---

## 5️⃣ Unit Testing Controller Generator (Non-AI Flow)

| ID   | Nama Pengujian          | Tujuan                      | Input              | Ekspektasi            |
| ---- | ----------------------- | --------------------------- | ------------------ | --------------------- |
| C-01 | Full Pipeline Valid     | Uji alur lengkap            | Folder API valid   | Dokumentasi terbentuk |
| C-02 | Pipeline Tanpa Endpoint | Handling endpoint kosong    | Folder tanpa route | Tidak crash           |
| C-03 | Output Dokumentasi      | Validasi output akhir       | Pipeline sukses    | OpenAPI valid         |
| C-04 | Integrasi Scoring       | Validasi scoring ikut jalan | Pipeline lengkap   | Skor muncul           |
| C-05 | Error Handling          | Handling error global       | File rusak         | Error aman            |

---

## Ringkasan

| Modul                | Jumlah Test      |
| -------------------- | ---------------- |
| Parser AST           | 6                |
| Folder Scanner       | 5                |
| Mapper OpenAPI       | 5                |
| Quality Scoring      | 5                |
| Controller Generator | 5                |
| **Total**            | **26 Test Case** |

---
