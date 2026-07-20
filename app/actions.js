'use server';

import { GoogleGenAI } from '@google/genai';

// Database Soal Fallback Berkualitas Tinggi untuk Uji Coba Offline / Tanpa API Key
const FALLBACK_QUESTIONS = {
  'UTBK Pengetahuan Kuantitatif': [
    {
      question: "Jika x dan y adalah bilangan bulat positif yang memenuhi x^2 - y^2 = 37, berapakah nilai dari x^2 + y^2?",
      options: [
        "A. 685",
        "B. 725",
        "C. 684",
        "D. 700"
      ],
      correct_answer_index: 0,
      explanation: "Karena 37 adalah bilangan prima, pemfaktoran dari x^2 - y^2 = (x - y)(x + y) = 37 hanya memiliki satu pasangan faktor bulat positif yang mungkin: (x - y) = 1 dan (x + y) = 37. Menjumlahkan kedua persamaan tersebut menghasilkan 2x = 38 => x = 19. Mengurangkan kedua persamaan menghasilkan 2y = 36 => y = 18. Maka, x^2 + y^2 = 19^2 + 18^2 = 361 + 324 = 685. Opsi pengecoh B salah hitung, C salah pemfaktoran, D pembulatan keliru."
    },
    {
      question: "Sebuah toko pakaian memberikan diskon berturut-turut sebesar 30% dan kemudian 20%. Jika harga akhir suatu pakaian setelah kedua diskon tersebut adalah Rp112.000, berapa harga awal pakaian tersebut?",
      options: [
        "A. Rp200.000",
        "B. Rp180.000",
        "C. Rp224.000",
        "D. Rp250.000"
      ],
      correct_answer_index: 0,
      explanation: "Diskon berturut-turut tidak diakumulasikan dengan penjumlahan (yaitu bukan diskon 50%), melainkan dihitung secara multiplikatif. Faktor pengali harga akhir adalah (1 - 0,30) * (1 - 0,20) = 0,70 * 0,80 = 0,56. Dengan demikian, Harga Awal * 0,56 = Rp112.000. Harga Awal = Rp112.000 / 0,56 = Rp200.000. Pengecoh C berasumsi diskon dihitung dari harga akhir ditambah Rp112.000, pengecoh B salah hitung persentase."
    },
    {
      question: "Dalam sebuah kotak terdapat 5 bola merah dan 3 bola putih. Jika diambil 2 bola secara acak satu per satu TANPA pengembalian, peluang terambilnya bola pertama merah dan bola kedua putih adalah...",
      options: [
        "A. 15/56",
        "B. 15/64",
        "C. 5/8",
        "D. 9/56"
      ],
      correct_answer_index: 0,
      explanation: "Peluang bola pertama merah adalah 5/8. Karena diambil tanpa pengembalian, sisa bola di dalam kotak adalah 7 buah, dengan jumlah bola putih tetap 3 buah. Peluang bola kedua putih adalah 3/7. Peluang gabungan untuk kejadian terambil bola pertama merah DAN kedua putih adalah hasil kali dari masing-masing peluang: (5/8) * (3/7) = 15/56. Pengecoh B menggunakan asumsi dengan pengembalian (5/8 * 3/8 = 15/64). Pengecoh C hanya menjumlahkan peluang awal secara keliru."
    },
    {
      question: "Sebuah garis melewati titik (2, 3) dan tegak lurus dengan garis 2x - 3y = 6. Persamaan garis tersebut adalah...",
      options: [
        "A. 3x + 2y - 12 = 0",
        "B. 3x + 2y - 6 = 0",
        "C. 2x + 3y - 13 = 0",
        "D. 3x - 2y = 0"
      ],
      correct_answer_index: 0,
      explanation: "Gradien garis pertama (2x - 3y = 6) adalah m1 = 2/3. Karena garis yang dicari tegak lurus dengannya, maka gradiennya m2 memenuhi m1 * m2 = -1 => m2 = -3/2. Dengan menggunakan rumus titik gradien y - y1 = m(x - x1): y - 3 = -3/2(x - 2) => 2y - 6 = -3x + 6 => 3x + 2y - 12 = 0. Opsi B salah menghitung konstanta, opsi C berasumsi garis sejajar bukan tegak lurus."
    },
    {
      question: "Jika f(x) = 2x + 3 dan g(x) = x^2 - 1, berapakah nilai dari komposisi fungsi (g o f)(1)?",
      options: [
        "A. 24",
        "B. 25",
        "C. 3",
        "D. 0"
      ],
      correct_answer_index: 0,
      explanation: "Komposisi (g o f)(1) berarti g(f(1)). Pertama, cari nilai f(1): f(1) = 2(1) + 3 = 5. Kemudian, substitusikan nilai ini ke fungsi g(x): g(5) = 5^2 - 1 = 25 - 1 = 24. Pengecoh B lupa mengurangi 1 (hanya menghitung f(1)^2), sedangkan opsi C menghitung (f o g)(1) secara terbalik."
    }
  ],
  'Ilmu Komputer': [
    {
      question: "Dalam analisis algoritma, manakah dari struktur data berikut yang memiliki kompleksitas waktu rata-rata (average case) O(1) untuk operasi pencarian (search)?",
      options: [
        "A. Hash Table",
        "B. Binary Search Tree",
        "C. Balanced AVL Tree",
        "D. Skip List"
      ],
      correct_answer_index: 0,
      explanation: "Hash Table menggunakan fungsi hash untuk memetakan kunci secara langsung ke indeks array penyimpanan, menghasilkan kompleksitas pencarian rata-rata O(1) jika beban fungsi hash merata. BST memiliki kompleksitas pencarian rata-rata O(log n) dan terburuk O(n). AVL Tree menjamin O(log n) untuk kasus terburuk dengan rotasi penyeimbang. Skip List juga memiliki O(log n) rata-rata. Pengecoh BST dan AVL sering dipilih oleh yang menyamakan efisiensi pencarian indeks dengan hash."
    },
    {
      question: "Manakah protokol lapisan transport pada model TCP/IP yang bersifat 'connectionless' dan tidak menjamin pengiriman paket data sampai ke tujuan secara berurutan?",
      options: [
        "A. UDP (User Datagram Protocol)",
        "B. TCP (Transmission Control Protocol)",
        "C. IP (Internet Protocol)",
        "D. ICMP (Internet Control Message Protocol)"
      ],
      correct_answer_index: 0,
      explanation: "UDP adalah protokol lapisan transport yang bersifat connectionless (tanpa jaminan koneksi awal) dan tidak menjamin urutan atau kedatangan paket, mengutamakan kecepatan. TCP bersifat connection-oriented dan memberikan jaminan urutan dan integritas paket. IP dan ICMP berada di lapisan Internet (Network Layer), bukan transport layer. Ini merupakan perbedaan mendasar model TCP/IP."
    },
    {
      question: "Dalam pemrograman berorientasi objek (OOP), prinsip yang memungkinkan subkelas untuk menyediakan implementasi spesifik dari metode yang sudah didefinisikan oleh superkelasnya disebut...",
      options: [
        "A. Method Overriding",
        "B. Method Overloading",
        "C. Encapsulation",
        "D. Polymorphism Coercion"
      ],
      correct_answer_index: 0,
      explanation: "Method Overriding memungkinkan subkelas menggantikan implementasi metode superkelas yang memiliki nama dan tanda tangan parameter yang sama. Method Overloading adalah mendefinisikan beberapa metode dengan nama sama tetapi parameter berbeda di kelas yang sama. Encapsulation adalah pembungkusan data. Polymorphism Coercion adalah konversi tipe data otomatis. Overriding adalah bentuk polimorfisme dinamis runtime."
    },
    {
      question: "Dalam sistem operasi, kondisi di mana dua atau lebih proses saling menunggu sumber daya yang dipegang oleh proses lainnya, sehingga tidak ada proses yang berjalan disebut...",
      options: [
        "A. Deadlock",
        "B. Starvation",
        "C. Race Condition",
        "D. Mutual Exclusion"
      ],
      correct_answer_index: 0,
      explanation: "Deadlock terjadi saat proses-proses mengalami kebuntuan karena masing-masing memegang sumber daya dan menunggu sumber daya yang dipegang oleh proses lain dalam siklus tertutup. Starvation adalah kondisi di mana suatu proses tidak pernah mendapatkan sumber daya karena kalah prioritas. Race Condition adalah inkonsistensi data akibat eksekusi konkuren yang tidak tersinkronisasi. Mutual Exclusion adalah pencegahan proses lain mengakses critical section secara bersamaan."
    },
    {
      question: "Manakah dari berikut yang merupakan representasi biner dari bilangan desimal 45?",
      options: [
        "A. 101101",
        "B. 101111",
        "C. 110001",
        "D. 100101"
      ],
      correct_answer_index: 0,
      explanation: "Untuk mengubah desimal 45 ke biner: 45 / 2 = 22 sisa 1; 22 / 2 = 11 sisa 0; 11 / 2 = 5 sisa 1; 5 / 2 = 2 sisa 1; 2 / 2 = 1 sisa 0; 1 / 2 = 0 sisa 1. Membaca sisa dari bawah ke atas memberikan 101101. Secara nilai: 32 + 8 + 4 + 1 = 45. Opsi lain adalah salah hitung bit desimal."
    }
  ],
  'Sejarah': [
    {
      question: "Konferensi Meja Bundar (KMB) yang berlangsung di Den Haag pada tahun 1949 menghasilkan keputusan penting bagi kedaulatan Indonesia. Namun, terdapat satu wilayah kedaulatan Indonesia yang penyerahannya ditangguhkan selama satu tahun oleh Belanda. Wilayah manakah yang dimaksud?",
      options: [
        "A. Irian Barat",
        "B. Timor Timur",
        "C. Sulawesi Selatan",
        "D. Maluku Selatan"
      ],
      correct_answer_index: 0,
      explanation: "Pada KMB tahun 1949 Belanda menyetujui penyerahan kedaulatan kepada Republik Indonesia Serikat (RIS) untuk seluruh bekas jajahan Hindia Belanda kecuali Irian Barat, yang statusnya ditangguhkan untuk dibahas kembali setahun berikutnya. Sengketa ini berlarut-larut hingga Perjanjian New York 1962. Opsi lain tidak berkaitan dengan penangguhan status wilayah jajahan KMB."
    },
    {
      question: "Politik Etis atau Politik Balas Budi yang diterapkan oleh pemerintah kolonial Belanda pada awal abad ke-20 didasarkan pada kritik Conrad Theodor van Deventer. Tiga pilar utama kebijakan ini adalah...",
      options: [
        "A. Irigasi, Edukasi, Migrasi",
        "B. Industrialisasi, Edukasi, Transmigrasi",
        "C. Irigasi, Transportasi, Edukasi",
        "D. Eksploitasi, Edukasi, Emansipasi"
      ],
      correct_answer_index: 0,
      explanation: "Trias van Deventer terdiri dari Irigasi (pengairan sawah untuk petani lokal), Edukasi (pemberian akses sekolah bagi bumiputera yang kelak melahirkan kaum intelektual pergerakan), dan Migrasi/Emigrasi (perpindahan penduduk ke luar Jawa untuk menyediakan tenaga kerja di perkebunan swasta). Opsi lain mencampurkan istilah transmigrasi modern atau industrialisasi yang tidak sesuai konteks sejarah asli."
    },
    {
      question: "Perang Diponegoro (1825-1830) yang merupakan salah satu perang terbesar melawan pemerintah kolonial Belanda di Jawa dipicu oleh sebab khusus, yaitu...",
      options: [
        "A. Pemasangan patok jalan oleh Belanda yang melintasi makam leluhur Pangeran Diponegoro di Tegalrejo",
        "B. Belanda ikut campur dalam pengangkatan Sultan Hamengkubuwono V secara sepihak",
        "C. Penerapan pajak tanah (landrent) yang mencekik para bangsawan kraton",
        "D. Penangkapan paksa Pangeran Diponegoro di kediamannya oleh Jenderal De Kock"
      ],
      correct_answer_index: 0,
      explanation: "Sebab khusus meletusnya Perang Diponegoro adalah pemasangan patok oleh pihak Belanda (atas prakarsa Patih Danurejo IV yang bersekongkol dengan Belanda) untuk pembuatan jalan yang melintasi tanah leluhur Pangeran Diponegoro di Tegalrejo tanpa izin. Sebab umum lainnya meliputi pajak yang berat dan campur tangan kraton, namun patok makam adalah pemicu langsung (sebab khusus). Penangkapan Diponegoro terjadi di akhir perang pada 1830."
    },
    {
      question: "Perjanjian Linggajati (1947) menghasilkan pengakuan de facto Belanda terhadap wilayah Republik Indonesia yang meliputi...",
      options: [
        "A. Jawa, Sumatra, dan Madura",
        "B. Jawa dan Madura saja",
        "C. Seluruh wilayah bekas jajahan Hindia Belanda",
        "D. Jawa, Sumatra, Kalimantan, dan Sulawesi"
      ],
      correct_answer_index: 0,
      explanation: "Dalam Perjanjian Linggajati yang ditandatangani pada Maret 1947, Belanda secara de facto mengakui wilayah kekuasaan Republik Indonesia yang meliputi Sumatra, Jawa, dan Madura. Wilayah lain direncanakan masuk dalam federasi negara Indonesia Serikat. Pengecoh D merepresentasikan klaim awal RI, sedangkan C adalah target akhir kemerdekaan."
    },
    {
      question: "Manakah badan bentukan Jepang yang bertugas menyelidiki usaha-usaha persiapan kemerdekaan Indonesia dan merumuskan dasar negara serta rancangan UUD?",
      options: [
        "A. BPUPKI (Dokuritsu Junbi Cosakai)",
        "B. PPKI (Dokuritsu Junbi Inkai)",
        "C. Keibodan",
        "D. Putera (Pusat Tenaga Rakyat)"
      ],
      correct_answer_index: 0,
      explanation: "BPUPKI dibentuk pada 1 Maret 1945 oleh Jenderal Kumakichi Harada dengan tugas menyelidiki usaha persiapan kemerdekaan, merumuskan Pancasila dan rancangan UUD. PPKI didirikan setelah BPUPKI dibubarkan untuk mengesahkan rumusan tersebut. Keibodan adalah barisan pembantu polisi. Putera adalah organisasi bentukan Jepang untuk menarik simpati rakyat melalui tokoh empat serangkai."
    }
  ],
  'Biologi': [
    {
      question: "Pada proses fotosintesis tumbuhan C3, pengikatan (fiksasi) CO2 pertama kali terjadi di stroma dengan bantuan enzim Rubisco. Senyawa stabil berkarbon-3 yang pertama kali terbentuk dari fiksasi tersebut adalah...",
      options: [
        "A. 3-Fosfogliserat (3-PGA)",
        "B. RuBP (Ribulosa 1,5-bifosfat)",
        "C. Oksaloasetat",
        "D. Fosfoenolpiruvat (PEP)"
      ],
      correct_answer_index: 0,
      explanation: "Fiksasi CO2 pada tumbuhan C3 bereaksi dengan akseptor RuBP (senyawa C-5) dikatalisis Rubisco membentuk senyawa antara C-6 tidak stabil yang dengan cepat terurai menjadi dua molekul 3-Fosfogliserat (3-PGA) yang stabil dengan 3 atom karbon. Oksaloasetat (C-4) adalah produk awal fiksasi tumbuhan C4/CAM dibantu PEP karboksilase."
    },
    {
      question: "Manakah organel sel berikut yang berperan penting dalam proses autolisis (penghancuran diri sel yang rusak) dan degradasi makromolekul organik menggunakan enzim hidrolitik?",
      options: [
        "A. Lisosom",
        "B. Peroksisom",
        "C. Aparatus Golgi",
        "D. Mitokondria"
      ],
      correct_answer_index: 0,
      explanation: "Lisosom mengandung enzim hidrolitik asam (seperti protease, nuklease, lipase) yang berfungsi mencerna materi intraseluler (autofagi) dan melakukan autolisis (lisis sel total). Peroksisom mengandung enzim oksidatif dan katalase untuk memecah hidrogen peroksida. Aparatus Golgi memodifikasi dan mengemas protein. Mitokondria adalah situs produksi ATP respirasi sel."
    },
    {
      question: "Pada respirasi seluler aerob, tahap yang menghasilkan ATP paling banyak melalui mekanisme fosforilasi oksidatif yang memanfaatkan gradien proton (kemiosmosis) adalah...",
      options: [
        "A. Transpor Elektron",
        "B. Siklus Krebs (Siklus Asam Sitrat)",
        "C. Glikolisis",
        "D. Dekarboksilasi Oksidatif"
      ],
      correct_answer_index: 0,
      explanation: "Rantai transpor elektron memanen elektron dari NADH dan FADH2 untuk memompa proton ke ruang antarmembran. Aliran balik proton melalui ATP sintase menghasilkan sekitar 28-34 ATP per molekul glukosa. Siklus Krebs hanya menghasilkan 2 ATP langsung, glikolisis menghasilkan 2 ATP bersih, dekarboksilasi oksidatif tidak menghasilkan ATP langsung."
    },
    {
      question: "Persilangan antara tanaman ercis biji bulat kuning (BbKk) dengan biji keriput hijau (bbkk) menghasilkan keturunan. Berapakah rasio fenotipe bulat kuning : bulat hijau : keriput kuning : keriput hijau yang diharapkan?",
      options: [
        "A. 1 : 1 : 1 : 1",
        "B. 9 : 3 : 3 : 1",
        "C. 3 : 1 : 3 : 1",
        "D. 15 : 1"
      ],
      correct_answer_index: 0,
      explanation: "Persilangan ini adalah testcross dihibrida (BbKk x bbkk). Gamet dari BbKk adalah BK, Bk, bK, bk, sedangkan gamet dari bbkk hanya bk. Kombinasi persilangan menghasilkan keturunan dengan genotipe BbKk (bulat kuning), Bbkk (bulat hijau), bbKk (keriput kuning), dan bbkk (keriput hijau) dalam jumlah yang sama, menghasilkan rasio fenotipe 1:1:1:1. Rasio 9:3:3:1 diperoleh dari persilangan sesama dihibrida heterozigot (BbKk x BbKk)."
    },
    {
      question: "Manakah hormon tumbuhan yang berperan dominan dalam merangsang pemanjangan sel apical (ujung batang), fototropisme, serta menjaga dominansi apikal pada tanaman?",
      options: [
        "A. Auksin (IAA)",
        "B. Giberelin",
        "C. Sitokinin",
        "D. Asam Absisat (ABA)"
      ],
      correct_answer_index: 0,
      explanation: "Auksin (seperti IAA) diproduksi di meristem apikal dan menginduksi pemanjangan sel, fototropisme (bermigrasi ke sisi teduh tumbuhan sehingga tumbuh membelok ke cahaya), serta menghambat pertumbuhan tunas lateral (dominansi apikal). Giberelin berperan dalam perkecambahan dan pemanjangan ruas batang. Sitokinin memicu pembelahan sel (sitokinesis) dan menunda penuaan daun. Asam Absisat memicu dormansi dan penutupan stomata saat stres air."
    }
  ],
  'Kimia': [
    {
      question: "Larutan penyangga (buffer) dapat dibuat dengan mereaksikan asam lemah dan basa kuat. Campuran manakah di bawah ini yang akan menghasilkan larutan penyangga bersifat asam?",
      options: [
        "A. 100 mL CH3COOH 0,2 M + 100 mL NaOH 0,1 M",
        "B. 100 mL CH3COOH 0,1 M + 100 mL NaOH 0,1 M",
        "C. 100 mL HCl 0,1 M + 100 mL NH3 0,2 M",
        "D. 100 mL CH3COOH 0,1 M + 100 mL NaOH 0,2 M"
      ],
      correct_answer_index: 0,
      explanation: "Larutan penyangga asam terbentuk dari asam lemah sisa (berlebih) setelah bereaksi dengan basa kuat. CH3COOH (asam lemah) = 100 mL * 0,2 M = 20 mmol. NaOH (basa kuat) = 100 mL * 0,1 M = 10 mmol. CH3COOH sisa 10 mmol dan terbentuk CH3COONa (basa konjugasi) 10 mmol, memenuhi syarat penyangga. Opsi B habis bereaksi membentuk garam terhidrolisis. Opsi C menghasilkan buffer basa karena sisa basa lemah NH3. Opsi D kelebihan basa kuat NaOH sehingga menjadi larutan basa kuat."
    },
    {
      question: "Manakah kelompok sifat koligatif larutan berikut yang hanya bergantung pada jumlah partikel zat terlarut dan bukan pada jenis zat terlarut?",
      options: [
        "A. Penurunan tekanan uap, Penurunan titik beku, Kenaikan titik didih, Tekanan osmotik",
        "B. Penurunan titik beku, Tekanan osmotik, Kenaikan pH, Viskositas larutan",
        "C. Kenaikan titik didih, Penurunan titik beku, Tegangan permukaan, Konduktivitas elektrolit",
        "D. Tekanan osmotik, Penurunan tekanan uap, Kelarutan zat, Kenaikan titik didih"
      ],
      correct_answer_index: 0,
      explanation: "Empat sifat koligatif larutan yang didefinisikan secara termodinamika hanya berdasarkan fraksi mol zat terlarut (jumlah partikel) adalah: penurunan tekanan uap jenuh, penurunan titik beku, kenaikan titik didih, dan tekanan osmotik. pH, viskositas, tegangan permukaan, dan konduktivitas dipengaruhi kuat oleh identitas kimiawi spesifik dan sifat zat terlarut."
    },
    {
      question: "Berdasarkan teori asam-basa Bronsted-Lowry, pada reaksi: HSO4- + H2O <=> SO4^2- + H3O+, pasangan asam-basa konjugasi yang tepat adalah...",
      options: [
        "A. HSO4- dan SO4^2-",
        "B. HSO4- dan H3O+",
        "C. H2O dan SO4^2-",
        "D. H3O+ dan SO4^2-"
      ],
      correct_answer_index: 0,
      explanation: "Pasangan asam-basa konjugasi menurut Bronsted-Lowry adalah dua spesies yang hanya berbeda satu ion proton (H+). HSO4- bertindak sebagai asam (mendonorkan H+) dan setelah kehilangan H+ ia menjadi SO4^2- (basa konjugasinya). Jadi HSO4- dan SO4^2- adalah pasangan konjugasi. Pasangan lainnya adalah H2O (basa) dan H3O+ (asam konjugasi). Opsi lain tidak berpasangan selisih 1 H+."
    },
    {
      question: "Suatu sel volta memiliki elektrode Seng (Zn, Eo = -0,76 V) dan Tembaga (Cu, Eo = +0,34 V). Berapakah potensial standar sel (Eosel) yang dihasilkan oleh sel volta tersebut?",
      options: [
        "A. +1,10 V",
        "B. -1,10 V",
        "C. +0,42 V",
        "D. -0,42 V"
      ],
      correct_answer_index: 0,
      explanation: "Elektrode dengan potensial reduksi standar (Eo) lebih positif bertindak sebagai katode (reduksi), yaitu Tembaga (Cu, Eo = +0,34 V). Elektrode dengan Eo lebih negatif bertindak sebagai anode (oksidasi), yaitu Seng (Zn, Eo = -0,76 V). Potensial standar sel dihitung dengan: Eosel = Eokatode - Eoanode = Eocal(Cu) - Eocal(Zn) = +0,34 V - (-0,76 V) = +0,34 + 0,76 = +1,10 V. Reaksi sel berlangsung spontan (+). Opsi B bernilai negatif, C dan D salah hitung selisih."
    },
    {
      question: "Unsur dengan nomor atom 17 (Klorin) terletak pada golongan dan periode berapa dalam sistem periodik unsur?",
      options: [
        "A. Golongan VIIA, Periode 3",
        "B. Golongan VA, Periode 3",
        "C. Golongan VIIA, Periode 4",
        "D. Golongan VIIB, Periode 3"
      ],
      correct_answer_index: 0,
      explanation: "Konfigurasi elektron Klorin (Z=17) adalah 1s2 2s2 2p6 3s2 3p5 atau [Ne] 3s2 3p5. Elektron valensi berada pada subkulit 3s dan 3p dengan jumlah elektron valensi = 2 + 5 = 7, menandakan Golongan VIIA (karena berakhir di subkulit s/p, unsur utama A). Kulit terluar adalah n = 3, menandakan Periode 3. Golongan VIIB diisi oleh unsur transisi d. Periode 4 salah."
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
 * Jika API Key gagal, terblokir, atau tidak diatur, action ini otomatis mengembalikan
 * database soal fallback berkualitas tinggi sehingga aplikasi tidak crash/error.
 */
export async function generateQuiz(subject, difficulty, count = 5) {
  console.log(`generateQuiz terpanggil: Subject="${subject}", Difficulty="${difficulty}", Count=${count}`);
  
  // Tentukan batasan count antara 1-15
  const limitCount = Math.max(1, Math.min(15, count));

  try {
    const ai = getGeminiClient();
    
    // Jika client tidak bisa diinisialisasi karena tidak ada key
    if (!ai) {
      console.log('Mengaktifkan mode fallback: GEMINI_API_KEY kosong.');
      return getFallbackQuiz(subject, limitCount);
    }

    const prompt = `Buatkan ${limitCount} soal pilihan ganda yang sangat menantang tentang subjek "${subject}" dengan tingkat kesulitan "${difficulty}" dalam bahasa Indonesia. Pastikan pengecohnya sangat akademis dan menantang.`;

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
    // Jika server memblokir, ini akan memicu catch block dan mengaktifkan fallback.
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
    return {
      success: true,
      isFallback: false,
      questions: data.questions
    };

  } catch (error) {
    console.error('Error saat memanggil Gemini API, mengaktifkan mode fallback:', error.message);
    
    // Fallback otomatis
    return getFallbackQuiz(subject, limitCount);
  }
}

/**
 * Mengambil kuis dari database lokal jika API mengalami gangguan
 */
function getFallbackQuiz(subject, count) {
  // Ambil bank soal berdasarkan subjek terdekat, default ke kuantitatif jika subjek tidak cocok
  const subjectKey = FALLBACK_QUESTIONS[subject] ? subject : 'UTBK Pengetahuan Kuantitatif';
  const allQuestions = FALLBACK_QUESTIONS[subjectKey];
  
  // Acak urutan soal secara acak agar bervariasi bagi pengguna
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  
  // Ambil sebanyak count yang diminta
  const selectedQuestions = shuffled.slice(0, count);

  return {
    success: true,
    isFallback: true,
    questions: selectedQuestions
  };
}
