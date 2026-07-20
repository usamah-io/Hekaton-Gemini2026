'use server';

import { GoogleGenAI } from '@google/genai';

// Database Soal Fallback Berkualitas Tinggi untuk Uji Coba Offline
// Masing-masing subjek memiliki 15 soal yang dibagi berdasarkan tingkat kesulitan (5 Mudah, 5 Sedang, 5 Sulit)
const FALLBACK_QUESTIONS = {
  'UTBK Pengetahuan Kuantitatif': [
    // --- MUDAH (1-5) ---
    {
      question: "Persamaan kuadrat x^2 - 5x + 6 = 0 memiliki akar-akar x1 dan x2. Nilai dari (x1 + x2)^2 - 2x1.x2 adalah...",
      options: ["A. 13", "B. 25", "C. 19", "D. 7"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "x1 + x2 = 5 dan x1.x2 = 6. Maka, (x1 + x2)^2 - 2x1.x2 = 5^2 - 2(6) = 25 - 12 = 13. Opsi B lupa mengurangi 2.x1.x2."
    },
    {
      question: "Nilai suku banyak f(x) = x^3 - 2x^2 + 3x - 5 untuk x = 3 adalah...",
      options: ["A. 13", "B. 10", "C. 15", "D. 8"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "f(3) = 3^3 - 2(3)^2 + 3(3) - 5 = 27 - 18 + 9 - 5 = 13. Opsi B salah hitung pangkat, C salah operasi tanda."
    },
    {
      question: "Sebuah dadu dilemparkan sekali. Peluang munculnya mata dadu prima ganjil adalah...",
      options: ["A. 1/3", "B. 1/2", "C. 1/6", "D. 2/3"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Mata dadu = {1, 2, 3, 4, 5, 6}. Angka prima ganjil adalah {3, 5} (jumlahnya 2). Peluangnya = 2/6 = 1/3. Opsi B salah karena memasukkan angka 2 (prima genap)."
    },
    {
      question: "Jika log 2 = a dan log 3 = b, berapakah nilai dari log 18?",
      options: ["A. a + 2b", "B. 2a + b", "C. ab^2", "D. a^2 + b"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "log 18 = log (2 * 3^2) = log 2 + log 3^2 = log 2 + 2 log 3 = a + 2b. Opsi B terbalik koefisiennya."
    },
    {
      question: "Matriks A = [[2, 3], [1, 4]]. Determinan dari matriks A adalah...",
      options: ["A. 5", "B. 11", "C. 10", "D. 7"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Det(A) = ad - bc = (2 * 4) - (3 * 1) = 8 - 3 = 5. Opsi B salah menjumlahkan (ad + bc)."
    },
    // --- SEDANG (6-10) ---
    {
      question: "Sebuah toko pakaian memberikan diskon berturut-turut sebesar 30% dan kemudian 20%. Jika harga akhir suatu pakaian setelah kedua diskon tersebut adalah Rp112.000, berapa harga awal pakaian tersebut?",
      options: ["A. Rp200.000", "B. Rp180.000", "C. Rp224.000", "D. Rp250.000"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Diskon berturut-turut tidak diakumulasikan dengan penjumlahan (yaitu bukan diskon 50%), melainkan dihitung secara multiplikatif. Faktor pengali harga akhir adalah (1 - 0,30) * (1 - 0,20) = 0,70 * 0,80 = 0,56. Dengan demikian, Harga Awal * 0,56 = Rp112.000. Harga Awal = Rp112.000 / 0,56 = Rp200.000. Pengecoh C berasumsi diskon dihitung dari harga akhir ditambah Rp112.000, pengecoh B salah hitung persentase."
    },
    {
      question: "Sebuah garis melewati titik (2, 3) dan tegak lurus dengan garis 2x - 3y = 6. Persamaan garis tersebut adalah...",
      options: ["A. 3x + 2y - 12 = 0", "B. 3x + 2y - 6 = 0", "C. 2x + 3y - 13 = 0", "D. 3x - 2y = 0"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Gradien garis pertama (2x - 3y = 6) adalah m1 = 2/3. Karena garis yang dicari tegak lurus dengannya, maka gradiennya m2 memenuhi m1 * m2 = -1 => m2 = -3/2. Dengan menggunakan rumus titik gradien y - y1 = m(x - x1): y - 3 = -3/2(x - 2) => 2y - 6 = -3x + 6 => 3x + 2y - 12 = 0. Opsi B salah menghitung konstanta, opsi C berasumsi garis sejajar bukan tegak lurus."
    },
    {
      question: "Rata-rata tinggi badan 8 siswa adalah 165 cm. Setelah ditambah 2 siswa baru, rata-ratanya menjadi 166 cm. Rata-rata tinggi badan kedua siswa baru tersebut adalah...",
      options: ["A. 170 cm", "B. 168 cm", "C. 172 cm", "D. 169 cm"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Total tinggi 8 siswa awal = 8 * 165 = 1320 cm. Total tinggi 10 siswa setelah penambahan = 10 * 166 = 1660 cm. Total tinggi 2 siswa baru = 1660 - 1320 = 340 cm. Rata-rata 2 siswa baru = 340 / 2 = 170 cm."
    },
    {
      question: "Sebuah segitiga siku-siku memiliki panjang hipotenusa 25 cm dan salah satu sisi tegaknya 20 cm. Luas segitiga tersebut adalah...",
      options: ["A. 150 cm^2", "B. 300 cm^2", "C. 250 cm^2", "D. 200 cm^2"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Panjang sisi tegak lainnya = akar(25^2 - 20^2) = akar(625 - 400) = akar(225) = 15 cm. Luas segitiga = 1/2 * alas * tinggi = 1/2 * 20 * 15 = 150 cm^2."
    },
    {
      question: "Banyaknya bilangan ratusan dengan angka-angka berbeda yang dapat disusun dari angka {1, 2, 3, 4, 5} adalah...",
      options: ["A. 60", "B. 125", "C. 20", "D. 120"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Menggunakan aturan perkalian untuk 3 digit berbeda: slot ratusan (5 pilihan), slot puluhan (4 pilihan), slot satuan (3 pilihan). Total = 5 * 4 * 3 = 60 bilangan. Opsi B memperbolehkan pengulangan angka."
    },
    // --- SULIT (11-15) ---
    {
      question: "Jika x dan y adalah bilangan bulat positif yang memenuhi x^2 - y^2 = 37, berapakah nilai dari x^2 + y^2?",
      options: ["A. 685", "B. 725", "C. 684", "D. 700"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Karena 37 adalah bilangan prima, pemfaktoran dari x^2 - y^2 = (x - y)(x + y) = 37 hanya memiliki satu pasangan faktor bulat positif yang mungkin: (x - y) = 1 dan (x + y) = 37. Menjumlahkan kedua persamaan tersebut menghasilkan 2x = 38 => x = 19. Mengurangkan kedua persamaan menghasilkan 2y = 36 => y = 18. Maka, x^2 + y^2 = 19^2 + 18^2 = 361 + 324 = 685. Opsi pengecoh B salah hitung, C salah pemfaktoran, D pembulatan keliru."
    },
    {
      question: "Dalam sebuah kotak terdapat 5 bola merah dan 3 bola putih. Jika diambil 2 bola secara acak satu per satu TANPA pengembalian, peluang terambilnya bola pertama merah dan bola kedua putih adalah...",
      options: ["A. 15/56", "B. 15/64", "C. 5/8", "D. 9/56"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Peluang bola pertama merah adalah 5/8. Karena diambil tanpa pengembalian, sisa bola di dalam kotak adalah 7 buah, dengan jumlah bola putih tetap 3 buah. Peluang bola kedua putih adalah 3/7. Peluang gabungan untuk kejadian terambil bola pertama merah DAN kedua putih adalah hasil kali dari masing-masing peluang: (5/8) * (3/7) = 15/56. Pengecoh B menggunakan asumsi dengan pengembalian (5/8 * 3/8 = 15/64). Pengecoh C hanya menjumlahkan peluang awal secara keliru."
    },
    {
      question: "Jika f(x) = 2x + 3 dan g(x) = x^2 - 1, berapakah nilai dari komposisi fungsi (g o f)(1)?",
      options: ["A. 24", "B. 25", "C. 3", "D. 0"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Komposisi (g o f)(1) berarti g(f(1)). Pertama, cari nilai f(1): f(1) = 2(1) + 3 = 5. Kemudian, substitusikan nilai ini ke fungsi g(x): g(5) = 5^2 - 1 = 25 - 1 = 24. Pengecoh B lupa mengurangi 1 (hanya menghitung f(1)^2), sedangkan opsi C menghitung (f o g)(1) secara terbalik."
    },
    {
      question: "Tiga buah bilangan membentuk barisan aritmatika dengan jumlah 24. Jika hasil kali ketiga bilangan tersebut adalah 440, bilangan terbesarnya adalah...",
      options: ["A. 11", "B. 10", "C. 12", "D. 13"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Misalkan tiga bilangan tersebut: a - b, a, a + b. Jumlahnya = 3a = 24 => a = 8. Hasil kalinya = (8 - b)(8)(8 + b) = 440 => 64 - b^2 = 55 => b^2 = 9 => b = 3. Maka bilangan-bilangannya adalah 5, 8, 11. Bilangan terbesar adalah 11."
    },
    {
      question: "Dari 7 orang pengurus organisasi, akan dipilih seorang ketua, wakil ketua, dan sekretaris. Banyaknya cara susunan kepengurusan yang mungkin terbentuk adalah...",
      options: ["A. 210 cara", "B. 35 cara", "C. 120 cara", "D. 840 cara"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Karena posisi pengurus memperhatikan urutan jabatan (Ketua, Wakil, Sekretaris), kita menggunakan permutasi: P(7, 3) = 7! / (7-3)! = 7 * 6 * 5 = 210 cara. Opsi B menggunakan rumus kombinasi C(7,3) yang mengabaikan jabatan."
    }
  ],
  'Ilmu Komputer': [
    // --- MUDAH (1-5) ---
    {
      question: "Manakah dari berikut ini yang merupakan struktur data LIFO (Last In First Out)?",
      options: ["A. Stack", "B. Queue", "C. Linked List", "D. Binary Tree"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Stack menggunakan prinsip LIFO, di mana elemen terakhir yang masuk akan menjadi yang pertama kali dikeluarkan. Queue menggunakan prinsip FIFO (First In First Out)."
    },
    {
      question: "Perintah SQL manakah yang digunakan untuk menghapus baris data dari suatu tabel secara bersyarat?",
      options: ["A. DELETE", "B. DROP", "C. TRUNCATE", "D. REMOVE"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "DELETE digunakan untuk menghapus baris tertentu berdasarkan kondisi WHERE. DROP menghapus seluruh tabel/database dari sistem, dan TRUNCATE menghapus seluruh baris tanpa kondisi log."
    },
    {
      question: "Kode HTTP 404 memiliki arti...",
      options: ["A. Not Found", "B. Internal Server Error", "C. Unauthorized", "D. Bad Request"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Kode HTTP 404 menandakan bahwa sumber daya yang diminta oleh klien tidak dapat ditemukan di server. 500 adalah Internal Server Error."
    },
    {
      question: "Perintah git mana yang digunakan untuk menggabungkan cabang lain ke cabang aktif saat ini?",
      options: ["A. git merge", "B. git branch", "C. git checkout", "D. git commit"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "git merge digunakan untuk mengintegrasikan commit dari cabang lain ke cabang aktif Anda saat ini. git branch mengelola cabang."
    },
    {
      question: "Manakah dari berikut yang merupakan representasi biner dari bilangan desimal 45?",
      options: ["A. 101101", "B. 101111", "C. 110001", "D. 100101"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Untuk mengubah desimal 45 ke biner: 45 / 2 = 22 sisa 1; 22 / 2 = 11 sisa 0; 11 / 2 = 5 sisa 1; 5 / 2 = 2 sisa 1; 2 / 2 = 1 sisa 0; 1 / 2 = 0 sisa 1. Membaca sisa dari bawah ke atas memberikan 101101. Secara nilai: 32 + 8 + 4 + 1 = 45. Opsi lain adalah salah hitung bit desimal."
    },
    // --- SEDANG (6-10) ---
    {
      question: "Manakah protokol lapisan transport pada model TCP/IP yang bersifat 'connectionless' dan tidak menjamin pengiriman paket data sampai ke tujuan secara berurutan?",
      options: ["A. UDP (User Datagram Protocol)", "B. TCP (Transmission Control Protocol)", "C. IP (Internet Protocol)", "D. ICMP (Internet Control Message Protocol)"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "UDP adalah protokol lapisan transport yang bersifat connectionless (tanpa jaminan koneksi awal) dan tidak menjamin urutan atau kedatangan paket, mengutamakan kecepatan. TCP bersifat connection-oriented dan memberikan jaminan urutan dan integritas paket. IP dan ICMP berada di lapisan Internet (Network Layer), bukan transport layer. Ini merupakan perbedaan mendasar model TCP/IP."
    },
    {
      question: "Dalam pemrograman berorientasi objek (OOP), prinsip yang memungkinkan subkelas untuk menyediakan implementasi spesifik dari metode yang sudah didefinisikan oleh superkelasnya disebut...",
      options: ["A. Method Overriding", "B. Method Overloading", "C. Encapsulation", "D. Polymorphism Coercion"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Method Overriding memungkinkan subkelas menggantikan implementasi metode superkelas yang memiliki nama dan tanda tangan parameter yang sama. Method Overloading adalah mendefinisikan beberapa metode dengan nama sama tetapi parameter berbeda di kelas yang sama. Encapsulation adalah pembungkusan data. Polymorphism Coercion adalah konversi tipe data otomatis. Overriding adalah bentuk polimorfisme dinamis runtime."
    },
    {
      question: "Pada arsitektur jaringan OSI, lapisan yang bertanggung jawab untuk merutekan paket data melalui beberapa router adalah...",
      options: ["A. Network Layer", "B. Transport Layer", "C. Physical Layer", "D. Data Link Layer"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Network Layer (Lapisan ke-3) menangani alamat IP logis dan melakukan keputusan perutean (routing) paket."
    },
    {
      question: "Manakah jenis enkripsi yang menggunakan kunci yang sama untuk proses enkripsi dan dekripsi data?",
      options: ["A. Simetris", "B. Asimetris", "C. hashing", "D. Public Key Cryptography"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Enkripsi Simetris menggunakan satu kunci rahasia yang sama untuk enkripsi dan dekripsi. Asimetris menggunakan sepasang kunci public/private."
    },
    {
      question: "Kompleksitas waktu untuk melakukan pencarian biner (binary search) pada array berukuran n yang sudah terurut adalah...",
      options: ["A. O(log n)", "B. O(n)", "C. O(n log n)", "D. O(1)"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Binary search membagi ruang pencarian menjadi setengah pada setiap langkahnya, sehingga kompleksitasnya adalah O(log n)."
    },
    // --- SULIT (11-15) ---
    {
      question: "Dalam analisis algoritma, manakah dari struktur data berikut yang memiliki kompleksitas waktu rata-rata (average case) O(1) untuk operasi pencarian (search)?",
      options: ["A. Hash Table", "B. Binary Search Tree", "C. Balanced AVL Tree", "D. Skip List"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Hash Table menggunakan fungsi hash untuk memetakan kunci secara langsung ke indeks array penyimpanan, menghasilkan kompleksitas pencarian rata-rata O(1) jika beban fungsi hash merata. BST memiliki kompleksitas pencarian rata-rata O(log n) dan terburuk O(n). AVL Tree menjamin O(log n) untuk kasus terburuk dengan rotasi penyeimbang. Skip List juga memiliki O(log n) rata-rata. Pengecoh BST dan AVL sering dipilih oleh yang menyamakan efisiensi pencarian indeks dengan hash."
    },
    {
      question: "Dalam sistem operasi, kondisi di mana dua atau lebih proses saling menunggu sumber daya yang dipegang oleh proses lainnya, sehingga tidak ada proses yang berjalan disebut...",
      options: ["A. Deadlock", "B. Starvation", "C. Race Condition", "D. Mutual Exclusion"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Deadlock terjadi saat proses-proses mengalami kebuntuan karena masing-masing memegang sumber daya dan menunggu sumber daya yang dipegang oleh proses lain dalam siklus tertutup. Starvation adalah kondisi di mana suatu proses tidak pernah mendapatkan sumber daya karena kalah prioritas. Race Condition adalah inkonsistensi data akibat eksekusi konkuren yang tidak tersinkronisasi. Mutual Exclusion adalah pencegahan proses lain mengakses critical section secara bersamaan."
    },
    {
      question: "Manakah dari algoritma sorting berikut yang memiliki kompleksitas waktu kasus terburuk (worst case) O(n^2)?",
      options: ["A. Bubble Sort", "B. Merge Sort", "C. Heap Sort", "D. Quick Sort (dengan pivot optimal)"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Bubble Sort memiliki kompleksitas O(n^2) baik pada kasus rata-rata maupun terburuk karena membandingkan seluruh pasangan elemen secara berurutan. Merge Sort selalu O(n log n)."
    },
    {
      question: "Tahapan pertama dalam pembuatan compiler yang memecah barisan karakter menjadi kumpulan token disebut...",
      options: ["A. Lexical Analysis", "B. Syntax Analysis", "C. Semantic Analysis", "D. Code Generation"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Lexical Analysis (pemindai/scanner) membaca kode karakter demi karakter untuk mengubahnya menjadi token-token logis."
    },
    {
      question: "Dalam pemrograman, memori yang dialokasikan secara dinamis pada saat runtime menggunakan perintah new/malloc dialokasikan di area...",
      options: ["A. Heap", "B. Stack", "C. Static", "D. Register"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Alokasi memori dinamis terjadi di area Heap, sedangkan alokasi variabel lokal fungsi otomatis terjadi di Stack."
    }
  ],
  'Sejarah': [
    // --- MUDAH (1-5) ---
    {
      question: "Manakah badan bentukan Jepang yang bertugas menyelidiki usaha-usaha persiapan kemerdekaan Indonesia dan merumuskan dasar negara serta rancangan UUD?",
      options: ["A. BPUPKI (Dokuritsu Junbi Cosakai)", "B. PPKI (Dokuritsu Junbi Inkai)", "C. Keibodan", "D. Putera (Pusat Tenaga Rakyat)"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "BPUPKI dibentuk pada 1 Maret 1945 oleh Jenderal Kumakichi Harada dengan tugas menyelidiki usaha persiapan kemerdekaan, merumuskan Pancasila dan rancangan UUD. PPKI didirikan setelah BPUPKI dibubarkan untuk mengesahkan rumusan tersebut. Keibodan adalah barisan pembantu polisi. Putera adalah organisasi bentukan Jepang untuk menarik simpati rakyat melalui tokoh empat serangkai."
    },
    {
      question: "Peristiwa Rengasdengklok yang terjadi pada tanggal 16 Agustus 1945 didorong oleh desakan golongan muda untuk...",
      options: ["A. Mengamankan Soekarno-Hatta agar segera memproklamasikan kemerdekaan lepas dari pengaruh Jepang", "B. Menolak pembubaran BPUPKI oleh perwakilan pemerintah Jepang", "C. Membantu pendaratan tentara Sekutu di Teluk Jakarta", "D. Melakukan perundingan gencatan senjata dengan Jenderal Terauchi"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Peristiwa Rengasdengklok adalah penculikan Soekarno-Hatta oleh golongan muda agar menjauhkan mereka dari tekanan Jepang dan memaksa proklamasi kemerdekaan dilakukan secepatnya."
    },
    {
      question: "Sidang PPKI pertama pada tanggal 18 Agustus 1945 menghasilkan keputusan penting, yaitu...",
      options: ["A. Mengesahkan UUD 1945 serta memilih Soekarno dan Hatta sebagai Presiden dan Wakil Presiden", "B. Merumuskan teks Proklamasi Kemerdekaan", "C. Membentuk 12 Departemen Kementerian negara", "D. Menetapkan pembagian wilayah Indonesia menjadi 8 Provinsi"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Sidang pertama PPKI menetapkan UUD 1945, memilih Ir. Soekarno sebagai Presiden, Drs. Mohammad Hatta sebagai Wakil Presiden, dan membentuk Komite Nasional."
    },
    {
      question: "Kerajaan Buddha terbesar di Indonesia yang menjadi pusat pembelajaran agama Buddha di Asia Tenggara pada abad ke-7 hingga ke-11 adalah...",
      options: ["A. Sriwijaya", "B. Majapahit", "C. Tarumanegara", "D. Sailendra"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Kerajaan Sriwijaya yang berpusat di Palembang merupakan pusat maritim dan keagamaan Buddha terbesar di Asia Tenggara pada masa itu."
    },
    {
      question: "Kongres Pemuda II yang melahirkan ikrar Sumpah Pemuda pada 28 Oktober 1928 diselenggarakan di kota...",
      options: ["A. Jakarta", "B. Bandung", "C. Yogyakarta", "D. Surabaya"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Kongres Pemuda II diselenggarakan di Jakarta (Batavia) pada tiga gedung berbeda dan melahirkan keputusan bersejarah ikrar Sumpah Pemuda."
    },
    // --- SEDANG (6-10) ---
    {
      question: "Politik Etis atau Politik Balas Budi yang diterapkan oleh pemerintah kolonial Belanda pada awal abad ke-20 didasarkan pada kritik Conrad Theodor van Deventer. Tiga pilar utama kebijakan ini adalah...",
      options: ["A. Irigasi, Edukasi, Migrasi", "B. Industrialisasi, Edukasi, Transmigrasi", "C. Irigasi, Transportasi, Edukasi", "D. Eksploitasi, Edukasi, Emansipasi"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Trias van Deventer terdiri dari Irigasi (pengairan sawah untuk petani lokal), Edukasi (pemberian akses sekolah bagi bumiputera yang kelak melahirkan kaum intelektual pergerakan), dan Migrasi/Emigrasi (perpindahan penduduk ke luar Jawa untuk menyediakan tenaga kerja di perkebunan swasta). Opsi lain mencampurkan istilah transmigrasi modern atau industrialisasi yang tidak sesuai konteks sejarah asli."
    },
    {
      question: "Perjanjian Linggajati (1947) menghasilkan pengakuan de facto Belanda terhadap wilayah Republik Indonesia yang meliputi...",
      options: ["A. Jawa, Sumatra, dan Madura", "B. Jawa dan Madura saja", "C. Seluruh wilayah bekas jajahan Hindia Belanda", "D. Jawa, Sumatra, Kalimantan, dan Sulawesi"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Dalam Perjanjian Linggajati yang ditandatangani pada Maret 1947, Belanda secara de facto mengakui wilayah kekuasaan Republik Indonesia yang meliputi Sumatra, Jawa, dan Madura. Wilayah lain direncanakan masuk dalam federasi negara Indonesia Serikat. Pengecoh D merepresentasikan klaim awal RI, sedangkan C adalah target akhir kemerdekaan."
    },
    {
      question: "Sistem Tanam Paksa (Cultuurstelsel) yang dijalankan oleh Belanda di Indonesia sejak tahun 1830 diprakarsai oleh...",
      options: ["A. Johannes van den Bosch", "B. Herman Willem Daendels", "C. Thomas Stamford Raffles", "D. Jan Pieterzoon Coen"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Gubernur Jenderal Johannes van den Bosch memprakarsai Tanam Paksa untuk mengisi kekosongan kas keuangan Belanda pasca Perang Diponegoro dan Perang Belgia."
    },
    {
      question: "Dekrit Presiden 5 Juli 1959 dikeluarkan oleh Presiden Soekarno dengan keputusan utama...",
      options: ["A. Membubarkan Konstituante dan menetapkan kembalinya UUD 1945", "B. Membubarkan Partai Komunis Indonesia (PKI)", "C. Membentuk Kabinet Kerja baru", "D. Mengumumkan konfrontasi terhadap Federasi Malaysia"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Dekrit Presiden 5 Juli 1959 membubarkan Konstituante yang gagal merancang UUD baru, serta menyatakan berlakunya kembali UUD 1945 secara resmi."
    },
    {
      question: "Konferensi Asia Afrika (KAA) pertama diselenggarakan pada tahun 1955 di kota...",
      options: ["A. Bandung", "B. Bogor", "C. Jakarta", "D. Colombo"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "KAA diselenggarakan di Gedung Merdeka, Bandung, pada April 1955 untuk mempromosikan kerja sama ekonomi dan menentang kolonialisme."
    },
    // --- SULIT (11-15) ---
    {
      question: "Konferensi Meja Bundar (KMB) yang berlangsung di Den Haag pada tahun 1949 menghasilkan keputusan penting bagi kedaulatan Indonesia. Namun, terdapat satu wilayah kedaulatan Indonesia yang penyerahannya ditangguhkan selama satu tahun oleh Belanda. Wilayah manakah yang dimaksud?",
      options: ["A. Irian Barat", "B. Timor Timur", "C. Sulawesi Selatan", "D. Maluku Selatan"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Pada KMB tahun 1949 Belanda menyetujui penyerahan kedaulatan kepada Republik Indonesia Serikat (RIS) untuk seluruh bekas jajahan Hindia Belanda kecuali Irian Barat, yang statusnya ditangguhkan untuk dibahas kembali setahun berikutnya. Sengketa ini berlarut-larut hingga Perjanjian New York 1962. Opsi lain tidak berkaitan dengan penangguhan status wilayah jajahan KMB."
    },
    {
      question: "Perang Diponegoro (1825-1830) yang merupakan salah satu perang terbesar melawan pemerintah kolonial Belanda di Jawa dipicu oleh sebab khusus, yaitu...",
      options: ["A. Pemasangan patok jalan oleh Belanda yang melintasi makam leluhur Pangeran Diponegoro di Tegalrejo", "B. Belanda ikut campur dalam pengangkatan Sultan Hamengkubuwono V secara sepihak", "C. Penerapan pajak tanah (landrent) yang mencekik para bangsawan kraton", "D. Penangkapan paksa Pangeran Diponegoro di kediamannya oleh Jenderal De Kock"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Sebab khusus meletusnya Perang Diponegoro adalah pemasangan patok oleh pihak Belanda (atas prakarsa Patih Danurejo IV yang bersekongkol dengan Belanda) untuk pembuatan jalan yang melintasi tanah leluhur Pangeran Diponegoro di Tegalrejo tanpa izin. Sebab umum lainnya meliputi pajak yang berat dan campur tangan kraton, namun patok makam adalah pemicu langsung (sebab khusus). Penangkapan Diponegoro terjadi di akhir perang pada 1830."
    },
    {
      question: "Perang Padri (1803-1838) di Sumatra Barat pada mulanya dipicu oleh perseteruan internal antara...",
      options: ["A. Kaum Padri (ulama) dan Kaum Adat mengenai penerapan syariat Islam", "B. Kaum bangsawan Minang dan pasukan kolonial Belanda", "C. Sultan Minangkabau dengan pedagang perantara VOC", "D. Petani kelapa sawit dan penguasa perkebunan Belanda"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Perang Padri dimulai sebagai konflik saudara antara Kaum Padri yang ingin memurnikan ajaran Islam dan Kaum Adat yang masih mempertahankan kebiasaan lama."
    },
    {
      question: "Tuntutan TRITURA yang diserukan oleh para mahasiswa dan Kesatuan Aksi pada tahun 1966 berisi salah satu poin penting yaitu...",
      options: ["A. Bubarkan PKI", "B. Turunkan harga sembako", "C. Bersihkan kabinet dari unsur G30S", "D. Jawaban A, B, dan C benar"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "TRITURA (Tiga Tuntutan Rakyat) berisi: 1) Bubarkan PKI, 2) Bersihkan kabinet dari unsur-unsur G30S/PKI, 3) Turunkan harga/perbaikan ekonomi."
    },
    {
      question: "Perjanjian Renville (1948) yang ditandatangani di atas kapal perang AS menghasilkan kerugian bagi pihak Indonesia karena...",
      options: ["A. Wilayah kekuasaan RI menyempit akibat garis demarkasi Van Mook", "B. Ibukota Jakarta jatuh sepenuhnya ke tangan Belanda", "C. RIS harus dibubarkan seketika", "D. TNI wajib melebur ke dalam kesatuan militer KNIL"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Perjanjian Renville memaksa TNI mengosongkan wilayah kantong gerilya di Jawa Barat dan membatasi kedaulatan RI di daerah pendudukan Belanda."
    }
  ],
  'Biologi': [
    // --- MUDAH (1-5) ---
    {
      question: "Perbedaan struktural utama antara molekul DNA dan RNA terletak pada...",
      options: ["A. Jenis gula pentosa (deoksiribosa vs ribosa) dan basa pirimidin (Timin vs Urasil)", "B. Jenis gugus fosfat yang mengikat rantai heliks", "C. Letak sintesis protein di dalam organel sel", "D. Struktur lilitan rantai polinukleotida untai tunggal ganda"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "DNA mengandung gula deoksiribosa dan basa Timin (berpasangan dengan Adenin), sedangkan RNA mengandung gula ribosa dan basa Urasil."
    },
    {
      question: "Enzim katalase yang banyak ditemukan di sel hati berfungsi memecah senyawa beracun sisa metabolisme berupa...",
      options: ["A. H2O2 menjadi H2O dan O2", "B. CO2 menjadi C dan O2", "C. NH3 menjadi Urea", "D. Glukosa menjadi Asam Laktat"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Enzim katalase mendetoksifikasi Hidrogen Peroksida (H2O2) yang beracun menjadi Air (H2O) dan Oksigen (O2) yang aman bagi sel."
    },
    {
      question: "Bagian ginjal yang berfungsi menyaring darah untuk membentuk urine primer (filtrat glomerulus) melalui proses filtrasi adalah...",
      options: ["A. Glomerulus", "B. Tubulus Kontortus Proksimal", "C. Lengkung Henle", "D. Tubulus Kolektivus"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Proses filtrasi (penyaringan) darah terjadi di Glomerulus di dalam kapsul Bowman menghasilkan urine primer."
    },
    {
      question: "Proses sintesis protein terdiri dari transkripsi dan translasi. Tempat terjadinya proses translasi (penerjemahan kodon mRNA) adalah...",
      options: ["A. Ribosom", "B. Nukleus", "C. Lisosom", "D. Retikulum Endoplasma Halus"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Transkripsi terjadi di Nukleus (inti sel), sedangkan translasi terjadi di Ribosom di dalam sitoplasma."
    },
    {
      question: "Jaringan pengangkut pada tumbuhan yang berfungsi menyalurkan air dan garam mineral dari akar menuju daun adalah...",
      options: ["A. Xilem", "B. Floem", "C. Parenkim", "D. Kambium"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Xilem (pembuluh kayu) mengangkut air dan mineral dari akar ke daun, sedangkan Floem (pembuluh tapis) mengedarkan hasil fotosintesis."
    },
    // --- SEDANG (6-10) ---
    {
      question: "Persilangan antara tanaman ercis biji bulat kuning (BbKk) dengan biji keriput hijau (bbkk) menghasilkan keturunan. Berapakah rasio fenotipe bulat kuning : bulat hijau : keriput kuning : keriput hijau yang diharapkan?",
      options: ["A. 1 : 1 : 1 : 1", "B. 9 : 3 : 3 : 1", "C. 3 : 1 : 3 : 1", "D. 15 : 1"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Persilangan ini adalah testcross dihibrida (BbKk x bbkk). Gamet dari BbKk adalah BK, Bk, bK, bk, sedangkan gamet dari bbkk hanya bk. Kombinasi persilangan menghasilkan keturunan dengan genotipe BbKk (bulat kuning), Bbkk (bulat hijau), bbKk (keriput kuning), dan bbkk (keriput hijau) dalam jumlah yang sama, menghasilkan rasio fenotipe 1:1:1:1. Rasio 9:3:3:1 diperoleh dari persilangan sesama dihibrida heterozigot (BbKk x BbKk)."
    },
    {
      question: "Manakah hormon tumbuhan yang berperan dominan dalam merangsang pemanjangan sel apical (ujung batang), fototropisme, serta menjaga dominansi apikal pada tanaman?",
      options: ["A. Auksin (IAA)", "B. Giberelin", "C. Sitokinin", "D. Asam Absisat (ABA)"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Auksin (seperti IAA) diproduksi di meristem apikal dan menginduksi pemanjangan sel, fototropisme (bermigrasi ke sisi teduh tumbuhan sehingga tumbuh membelok ke cahaya), serta menghambat pertumbuhan tunas lateral (dominansi apikal). Giberelin berperan dalam perkecambahan dan pemanjangan ruas batang. Sitokinin memicu pembelahan sel (sitokinesis) dan menunda penuaan daun. Asam Absisat memicu dormansi dan penutupan stomata saat stres air."
    },
    {
      question: "Sistem peredaran darah manusia bersifat tertutup dan ganda. Urutan jalannya darah bersih yang kaya oksigen dari paru-paru kembali ke seluruh tubuh adalah...",
      options: ["A. Paru-paru -> Vena Pulmonalis -> Serambi Kiri -> Bilik Kiri -> Aorta -> Seluruh Tubuh", "B. Paru-paru -> Arteri Pulmonalis -> Serambi Kanan -> Bilik Kanan -> Seluruh Tubuh", "C. Paru-paru -> Serambi Kiri -> Bilik Kiri -> Vena Cava -> Seluruh Tubuh", "D. Paru-paru -> Vena Pulmonalis -> Serambi Kanan -> Bilik Kanan -> Seluruh Tubuh"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Darah bersih dari paru-paru dibawa oleh Vena Pulmonalis menuju Serambi Kiri, masuk ke Bilik Kiri, dan dipompa melalui Aorta ke seluruh tubuh."
    },
    {
      question: "Berdasarkan teori evolusi Jean-Baptiste Lamarck, organ tubuh yang sering digunakan akan berkembang sedangkan yang tidak digunakan akan menyusut (use and disuse), dan sifat ini...",
      options: ["A. Diwariskan kepada keturunannya", "B. Tidak mempengaruhi variasi genetik", "C. Terjadi secara acak melalui seleksi alam", "D. Ditentukan oleh isolasi geografi reproduksi"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Lamarck menyatakan bahwa perubahan struktur fisik akibat adaptasi penggunaan organ (use and disuse) akan diwariskan ke generasi selanjutnya."
    },
    {
      question: "Hukum Mendel II (Hukum Asortasi Bebas) dapat dibuktikan secara nyata melalui persilangan dengan sifat...",
      options: ["A. Dihibrida atau lebih", "B. Monohibrida dominan penuh", "C. Intermediet", "D. Kodominan gen tertaut"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Hukum Asortasi Bebas menyatakan bahwa gen-gen berbeda berpasangan secara bebas dalam gamet, dibuktikan melalui persilangan dihibrida (dua sifat beda)."
    },
    // --- SULIT (11-15) ---
    {
      question: "Pada proses fotosintesis tumbuhan C3, pengikatan (fiksasi) CO2 pertama kali terjadi di stroma dengan bantuan enzim Rubisco. Senyawa stabil berkarbon-3 yang pertama kali terbentuk dari fiksasi tersebut adalah...",
      options: ["A. 3-Fosfogliserat (3-PGA)", "B. RuBP (Ribulosa 1,5-bifosfat)", "C. Oksaloasetat", "D. Fosfoenolpiruvat (PEP)"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Fiksasi CO2 pada tumbuhan C3 bereaksi dengan akseptor RuBP (senyawa C-5) dikatalisis Rubisco membentuk senyawa antara C-6 tidak stabil yang dengan cepat terurai menjadi dua molekul 3-Fosfogliserat (3-PGA) yang stabil dengan 3 atom karbon. Oksaloasetat (C-4) adalah produk awal fiksasi tumbuhan C4/CAM dibantu PEP karboksilase."
    },
    {
      question: "Manakah organel sel berikut yang berperan penting dalam proses autolisis (penghancuran diri sel yang rusak) dan degradasi makromolekul organik menggunakan enzim hidrolitik?",
      options: ["A. Lisosom", "B. Peroksisom", "C. Aparatus Golgi", "D. Mitokondria"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Lisosom mengandung enzim hidrolitik asam (seperti protease, nuklease, lipase) yang berfungsi mencerna materi intraseluler (autofagi) dan melakukan autolisis (lisis sel total). Peroksisom mengandung enzim oksidatif dan katalase untuk memecah hidrogen peroksida. Aparatus Golgi memodifikasi dan mengemas protein. Mitokondria adalah situs produksi ATP respirasi sel."
    },
    {
      question: "Pada respirasi seluler aerob, tahap yang menghasilkan ATP paling banyak melalui mekanisme fosforilasi oksidatif yang memanfaatkan gradien proton (kemiosmosis) adalah...",
      options: ["A. Transpor Elektron", "B. Siklus Krebs (Siklus Asam Sitrat)", "C. Glikolisis", "D. Dekarboksilasi Oksidatif"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Rantai transpor elektron memanen elektron dari NADH dan FADH2 untuk memompa proton ke ruang antarmembran. Aliran balik proton melalui ATP sintase menghasilkan sekitar 28-34 ATP per molekul glukosa. Siklus Krebs hanya menghasilkan 2 ATP langsung, glikolisis menghasilkan 2 ATP bersih, dekarboksilasi oksidatif tidak menghasilkan ATP langsung."
    },
    {
      question: "Piramida energi menggambarkan aliran energi di ekosistem. Tingkat trofik yang memiliki jumlah energi paling besar di alam adalah...",
      options: ["A. Produsen (tumbuhan)", "B. Konsumen Primer", "C. Konsumen Sekunder", "D. Dekomposer"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Produsen (tingkat trofik 1) memfiksasi energi matahari secara langsung, memiliki kandungan energi terbesar sebelum menyusut akibat transfer trofik."
    },
    {
      question: "Pada pembelahan sel tahap mitosis, peristiwa kromatid saudara ditarik ke kutub yang berlawanan oleh benang spindel terjadi pada fase...",
      options: ["A. Anafase", "B. Metafase", "C. Profase", "D. Telofase"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Anafase merupakan tahap pemisahan kromatid saudara yang ditarik menuju kutub berlawanan oleh serat gelendong pembelahan."
    }
  ],
  'Kimia': [
    // --- MUDAH (1-5) ---
    {
      question: "Larutan HCl 0,01 M memiliki pH sebesar...",
      options: ["A. 2", "B. 1", "C. 12", "D. 3"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "HCl adalah asam kuat. [H+] = M * valensi = 0,01 * 1 = 10^-2 M. pH = -log[H+] = -log(10^-2) = 2."
    },
    {
      question: "Efek Tyndall merupakan peristiwa penghamburan cahaya oleh partikel koloid. Gejala ini dapat diamati secara nyata pada...",
      options: ["A. Sorot lampu proyektor bioskop di udara berdebu", "B. Penyaringan air sumur keruh", "C. Pembuatan agar-agar padat", "D. Terjadinya hujan akibat awan jenuh"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Sorot lampu di ruangan berdebu/berkabut menghamburkan cahaya karena debu bertindak sebagai partikel koloid (efek Tyndall)."
    },
    {
      question: "Berdasarkan teori asam-basa Bronsted-Lowry, pada reaksi: HSO4- + H2O <=> SO4^2- + H3O+, pasangan asam-basa konjugasi yang tepat adalah...",
      options: ["A. HSO4- dan SO4^2-", "B. HSO4- dan H3O+", "C. H2O dan SO4^2-", "D. H3O+ dan SO4^2-"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Pasangan asam-basa konjugasi menurut Bronsted-Lowry adalah dua spesies yang hanya berbeda satu ion proton (H+). HSO4- bertindak sebagai asam (mendonorkan H+) dan setelah kehilangan H+ ia menjadi SO4^2- (basa konjugasinya). Jadi HSO4- dan SO4^2- adalah pasangan konjugasi. Pasangan lainnya adalah H2O (basa) and H3O+ (asam konjugasi). Opsi lain tidak berpasangan selisih 1 H+."
    },
    {
      question: "Unsur dengan nomor atom 17 (Klorin) terletak pada golongan dan periode berapa dalam sistem periodik unsur?",
      options: ["A. Golongan VIIA, Periode 3", "B. Golongan VA, Periode 3", "C. Golongan VIIA, Periode 4", "D. Golongan VIIB, Periode 3"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Konfigurasi elektron Klorin (Z=17) adalah 1s2 2s2 2p6 3s2 3p5 atau [Ne] 3s2 3p5. Elektron valensi berada pada subkulit 3s dan 3p dengan jumlah elektron valensi = 2 + 5 = 7, menandakan Golongan VIIA (karena berakhir di subkulit s/p, unsur utama A). Kulit terluar adalah n = 3, menandakan Periode 3. Golongan VIIB diisi oleh unsur transisi d. Periode 4 salah."
    },
    {
      question: "Kenaikan suhu akan mempercepat laju reaksi karena...",
      options: ["A. Meningkatkan energi kinetik partikel dan jumlah tumbukan efektif", "B. Menurunkan energi aktivasi reaksi", "C. Meningkatkan konsentrasi zat pereaksi", "D. Mengubah arah jalannya reaksi eksoterm"],
      correct_answer_index: 0,
      difficulty: "Mudah",
      explanation: "Kenaikan suhu meningkatkan energi kinetik partikel sehingga lebih banyak partikel yang memiliki energi melampaui energi aktivasi untuk melakukan tumbukan efektif."
    },
    // --- SEDANG (6-10) ---
    {
      question: "Campuran manakah di bawah ini yang akan menghasilkan larutan penyangga bersifat asam?",
      options: ["A. 100 mL CH3COOH 0,2 M + 100 mL NaOH 0,1 M", "B. 100 mL CH3COOH 0,1 M + 100 mL NaOH 0,1 M", "C. 100 mL HCl 0,1 M + 100 mL NH3 0,2 M", "D. 100 mL CH3COOH 0,1 M + 100 mL NaOH 0,2 M"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Larutan penyangga asam terbentuk dari asam lemah sisa (berlebih) setelah bereaksi dengan basa kuat. CH3COOH (asam lemah) = 100 mL * 0,2 M = 20 mmol. NaOH (basa kuat) = 100 mL * 0,1 M = 10 mmol. CH3COOH sisa 10 mmol dan terbentuk CH3COONa (basa konjugasi) 10 mmol, memenuhi syarat penyangga. Opsi B habis bereaksi membentuk garam terhidrolisis. Opsi C menghasilkan buffer basa karena sisa basa lemah NH3. Opsi D kelebihan basa kuat NaOH sehingga menjadi larutan basa kuat."
    },
    {
      question: "Berdasarkan teori koligatif, sifat koligatif larutan hanya bergantung pada...",
      options: ["A. Jumlah partikel zat terlarut", "B. Jenis zat terlarut", "C. Sifat kelarutan zat pembakar", "D. Viskositas dan pH larutan"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Empat sifat koligatif larutan yang didefinisikan secara termodinamika hanya berdasarkan fraksi mol zat terlarut (jumlah partikel) dan bukan identitas kimianya."
    },
    {
      question: "Menurut Hukum Hess, perubahan entalpi suatu reaksi kimia hanya ditentukan oleh...",
      options: ["A. Keadaan awal dan keadaan akhir reaksi", "B. Jumlah tahapan lintasan jalannya reaksi", "C. Keberadaan katalisator pendukung", "D. Suhu dan volume ruang pembakaran"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Hukum Hess menyatakan bahwa entalpi reaksi bersifat fungsi keadaan, hanya tergantung pada kondisi reaktan awal dan produk akhir."
    },
    {
      question: "Garam CH3COONa yang dilarutkan dalam air akan mengalami hidrolisis sebagian dan bersifat...",
      options: ["A. Basa", "B. Asam", "C. Netral", "D. Amfoter"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "CH3COONa terbentuk dari asam lemah (CH3COOH) dan basa kuat (NaOH). Anion CH3COO- terhidrolisis menghasilkan ion OH-, membuat larutan bersifat basa."
    },
    {
      question: "Hukum laju reaksi untuk reaksi A + B -> C adalah r = k[A][B]^2. Jika konsentrasi B dinaikkan menjadi 3 kali semula sementara konsentrasi A tetap, laju reaksinya menjadi...",
      options: ["A. 9 kali semula", "B. 3 kali semula", "C. 6 kali semula", "D. 27 kali semula"],
      correct_answer_index: 0,
      difficulty: "Sedang",
      explanation: "Orde reaksi terhadap B adalah 2. Jika konsentrasi B naik 3 kali, laju reaksi akan meningkat sebesar 3^2 = 9 kali semula."
    },
    // --- SULIT (11-15) ---
    {
      question: "Suatu sel volta memiliki elektrode Seng (Zn, Eo = -0,76 V) dan Tembaga (Cu, Eo = +0,34 V). Berapakah potensial standar sel (Eosel) yang dihasilkan oleh sel volta tersebut?",
      options: ["A. +1,10 V", "B. -1,10 V", "C. +0,42 V", "D. -0,42 V"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Eosel = Eokatode - Eoanode = Eocal(Cu) - Eocal(Zn) = +0,34 V - (-0,76 V) = +1,10 V."
    },
    {
      question: "Ikatan kimia yang terbentuk akibat pemakaian pasangan elektron secara bersama-sama oleh dua atom non-logam yang memiliki perbedaan keelektronegatifan kecil atau nol disebut...",
      options: ["A. Ikatan Kovalen Nonpolar", "B. Ikatan Kovalen Polar", "C. Ikatan Ion", "D. Ikatan Logam"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Ikatan Kovalen Nonpolar terjadi ketika atom non-logam saling berbagi elektron secara merata tanpa polarisasi karena perbedaan keelektronegatifan sangat kecil."
    },
    {
      question: "Empat bilangan kuantum elektron terakhir dari atom oksigen (Z=8) adalah...",
      options: ["A. n=2, l=1, m=-1, s=-1/2", "B. n=2, l=0, m=0, s=+1/2", "C. n=2, l=1, m=+1, s=+1/2", "D. n=3, l=1, m=-1, s=-1/2"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Oksigen Z=8 adalah 1s2 2s2 2p4. Elektron terakhir berada di subkulit 2p (n=2, l=1, m=-1, s=-1/2)."
    },
    {
      question: "Nilai Ksp PbSO4 adalah 1,6 x 10^-8. Kelarutan (s) garam PbSO4 dalam air murni adalah...",
      options: ["A. 1,26 x 10^-4 M", "B. 1,6 x 10^-4 M", "C. 4,0 x 10^-4 M", "D. 2,56 x 10^-16 M"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "PbSO4 <=> Pb^2+ + SO4^2-. Ksp = s^2 => s = akar(Ksp) = akar(1,6 x 10^-8) = 1,26 x 10^-4 M."
    },
    {
      question: "Pada elektrolisis leburan NaCl dengan elektrode karbon, zat yang dihasilkan di katode adalah...",
      options: ["A. Logam Natrium", "B. Gas Klorin", "C. Gas Hidrogen", "D. Gas Oksigen"],
      correct_answer_index: 0,
      difficulty: "Sulit",
      explanation: "Pada elektrolisis leburan (tanpa air), kation Na+ direduksi langsung di katode membentuk logam Natrium cair."
    }
  ]
};

// Inisialisasi Google Gen AI client menggunakan SDK baru
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Peringatan: GEMINI_API_KEY tidak ditemukan di environment variable.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// System Instruction untuk Gemini agar menghasilkan kuis berkualitas tinggi
const SYSTEM_INSTRUCTION = `Anda adalah ahli akademik dan pembuat soal ujian profesional (seperti UTBK Nasional, SBMPTN, Olimpiade Sains, dan ujian sertifikasi kompetensi).

Tugas Anda adalah memformulasikan soal-soal pilihan ganda yang sangat menantang, akademis, dan mendidik dalam Bahasa Indonesia.

Setiap soal pilihan ganda harus memenuhi kriteria berikut secara mutlak:
1. Pertanyaan harus berbobot akademis tinggi, logis, dan menguji pemahaman konsep tingkat tinggi (HOTS - Higher Order Thinking Skills), bukan sekadar ingatan atau fakta sederhana.
2. Pilihan jawaban (options) terdiri dari TEPAT 4 opsi, berformat teks rapi (misal diawali "A. ...", "B. ...", "C. ...", "D. ...").
3. Pengecoh (distractors) harus dirancang secara akademis, logis, sangat menantang, dan tampak meyakinkan bagi yang tidak memahami konsep secara mendalam. Gunakan kesalahan logika umum, miskonsepsi umum, atau kesalahan perhitungan yang umum terjadi pada siswa untuk opsi pengecoh.
4. Indeks jawaban benar (correct_answer_index) adalah integer 0 sampai 3, yang menunjuk pada indeks array opsi (0 = opsi pertama, 1 = opsi kedua, dst).
5. Pembahasan (explanation) harus ditulis secara akademis, mendalam, dan mendidik. Jelaskan mengapa jawaban tersebut benar dan berikan sanggahan mengapa opsi pengecoh lainnya salah secara rasional.

Format keluaran wajib berupa JSON murni tanpa pembungkus markdown (\`\`\`json atau \`\`\`), dan wajib mematuhi skema JSON yang didefinisikan oleh sistem. Jangan mengembalikan teks non-JSON di luar struktur objek tersebut.`;

/**
 * Server Action untuk menghasilkan kuis dari Gemini.
 * Menerima parameter sesuai dengan urutan: subject, jumlahSoal, difficulty.
 */
export async function generateQuiz(subject, jumlahSoal = 5, difficulty = 'Sedang') {
  console.log(`generateQuiz terpanggil: Subject="${subject}", jumlahSoal=${jumlahSoal}, Difficulty="${difficulty}"`);
  
  // Tentukan batasan jumlahSoal antara 1-15
  const limitCount = Math.max(1, Math.min(15, jumlahSoal));

  try {
    const ai = getGeminiClient();
    
    // Jika client tidak bisa diinisialisasi karena tidak ada key
    if (!ai) {
      console.log('Mengaktifkan mode fallback: GEMINI_API_KEY kosong.');
      return getFallbackQuiz(subject, limitCount, difficulty);
    }

    const prompt = `Buatkan kuis pilihan ganda sebanyak ${limitCount} soal dengan tingkat kesulitan '${difficulty}' berdasarkan materi tentang subjek "${subject}" dalam bahasa Indonesia. Pastikan Gemini benar-benar menyesuaikan kompleksitas pertanyaan dan pilihan pengecoh jawaban berdasarkan tingkat kesulitan yang diminta (Mudah = dasar/langsung, Sedang = analisis menengah, Sulit = studi kasus/HOTS/analisis mendalam).`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        questions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              question: { type: "STRING" },
              options: {
                type: "ARRAY",
                items: { type: "STRING" },
                minItems: 4,
                maxItems: 4
              },
              correct_answer_index: { type: "INTEGER" },
              explanation: { type: "STRING" }
            },
            required: ["question", "options", "correct_answer_index", "explanation"]
          }
        }
      },
      required: ["questions"]
    };

    // Panggil API Gemini dengan model gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error('Respons kosong diterima dari Gemini API.');
    }

    // Parse JSON hasil kembalian
    const data = JSON.parse(responseText.trim());
    
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Struktur respons JSON tidak valid (data.questions tidak ditemukan/bukan array).');
    }

    console.log(`Berhasil men-generate ${data.questions.length} soal menggunakan Gemini AI.`);
    const shuffledQuestions = data.questions.map(q => shuffleQuestionOptions(q));
    return {
      success: true,
      isFallback: false,
      questions: shuffledQuestions
    };

  } catch (error) {
    console.error('Error saat memanggil Gemini API, mengaktifkan mode fallback:', error.message);
    
    // Fallback otomatis
    return getFallbackQuiz(subject, limitCount, difficulty);
  }
}

/**
 * Mengambil kuis dari database lokal jika API mengalami gangguan.
 * Menyaring soal berdasarkan tingkat kesulitan jika memungkinkan.
 */
function getFallbackQuiz(subject, count, difficulty) {
  const subjectKey = FALLBACK_QUESTIONS[subject] ? subject : 'UTBK Pengetahuan Kuantitatif';
  const allQuestions = FALLBACK_QUESTIONS[subjectKey];
  
  // Saring berdasarkan tingkat kesulitan
  let filtered = allQuestions.filter(q => q.difficulty === difficulty);
  
  // Jika tidak ditemukan/kurang, satukan kembali semua kategori agar jumlah soal mencukupi
  if (filtered.length < count) {
    const extraQuestions = allQuestions.filter(q => q.difficulty !== difficulty);
    filtered = [...filtered, ...extraQuestions];
  }
  
  // Acak urutan soal
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  
  // Ambil sebanyak count yang diminta
  const selectedQuestions = shuffled.slice(0, count);
  const shuffledQuestions = selectedQuestions.map(q => shuffleQuestionOptions(q));

  return {
    success: true,
    isFallback: true,
    questions: shuffledQuestions
  };
}

/**
 * Utilitas untuk mengacak pilihan jawaban dan memperbarui correct_answer_index
 */
function shuffleQuestionOptions(question) {
  const getRawText = (text) => {
    return text.replace(/^[A-D][\.\)]\s*/, '').trim();
  };

  const correctRaw = getRawText(question.options[question.correct_answer_index]);
  const rawOptions = question.options.map(opt => getRawText(opt));
  
  for (let i = rawOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rawOptions[i], rawOptions[j]] = [rawOptions[j], rawOptions[i]];
  }
  
  const prefixes = ["A. ", "B. ", "C. ", "D. "];
  const newOptions = rawOptions.map((raw, idx) => `${prefixes[idx]}${raw}`);
  const newCorrectIndex = rawOptions.findIndex(raw => raw === correctRaw);
  
  return {
    ...question,
    options: newOptions,
    correct_answer_index: newCorrectIndex !== -1 ? newCorrectIndex : 0
  };
}
