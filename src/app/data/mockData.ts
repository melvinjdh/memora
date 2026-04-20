export interface Museum {
  id: string;
  name: string;
  slug: string;
  heroImage: string;
  description: string;
  history: string;
  location: string;
  mapEmbedUrl: string;
  operatingHours: {
    day: string;
    hours: string;
  }[];
  tickets: {
    id: string;
    type: string;
    price: number;
    description: string;
  }[];
  facilities: string[];
  transportation: {
    publicTransport: string[];
    ridehailing: string;
    privateVehicle: string;
  };
  nearbyDining: {
    name: string;
    type: string;
    distance: string;
  }[];
  nearbyFacilities: {
    type: string;
    name: string;
    distance: string;
  }[];
}

export interface GuideReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TourGuide {
  id: string;
  name: string;
  photo: string;
  languages: string[];
  specialties: string[];
  rating: number;
  reviews: number;
  pricePerHour: number;
  availability: string[];
  gender: string;
  age: number;
  description: string;
  quote: string;
  mainMuseums: string[];
  reviewList: GuideReview[];
}

function formatDateToLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getUpcomingDates(offsets: number[]) {
  const today = new Date();

  return offsets.map((offset) => {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + offset);
    return formatDateToLocal(nextDate);
  });
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  museum: string;
  description: string;
  stock: number;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  items: {
    type: 'ticket' | 'guide' | 'merchandise';
    name: string;
    quantity: number;
    price: number;
    details?: any;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
}

export const museums: Museum[] = [
  {
  id: '1',
  name: 'Museum Sepuluh Nopember',
  slug: 'museum-sepuluh-nopember',
  heroImage: '',
  description: 'Museum perjuangan yang mengenang heroisme Pertempuran 10 November 1945 di Surabaya.',
  history: 'Berada tepat di bawah kawasan Tugu Pahlawan, museum ini menyimpan memori heroik Pertempuran 10 November 1945 melalui galeri foto dan video perang, diorama pertempuran, serta ruang audio visual yang menampilkan semangat perjuangan arek-arek Suroboyo.',
  location: 'Jl. Pahlawan, Alun-alun Contong, Kec. Bubutan, Surabaya, Jawa Timur 60174',
  mapEmbedUrl: 'https://maps.app.goo.gl/BazRPMBUayrAdiiJ8',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 15:00 WIB' },
    { day: 'Senin dan hari libur nasional', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't1', type: 'Umum', price: 8000, description: 'Tiket umum per orang' },
    { id: 't2', type: 'Wisatawan Asing', price: 15000, description: 'Tiket wisatawan asing per orang' },
    { id: 't3', type: 'Pelajar Luar Surabaya', price: 3000, description: 'Dengan identitas pelajar/mahasiswa' },
    { id: 't4', type: 'Pelajar Surabaya', price: 0, description: 'Gratis dengan menunjukkan kartu pelajar/mahasiswa yang masih berlaku' }
  ],
  facilities: [
    'Galeri foto/video perang 10 November',
    'Diorama Pertempuran',
    'Auditorium',
    'Toilet Umum',
    'Mushola',
    'Tempat Parkir'
  ],
transportation: {
    publicTransport: [
      'Bus rute BJ, D, DA, LMJ, O dengan turun di halte Tugu Pahlawan lalu jalan kaki sekitar 4 menit',
      'WaraWiri rute S1 atau S2 ke Halte Pasar Turi',
      'Kereta KAI melalui Stasiun Pasar Turi lalu jalan kaki sekitar 800 meter'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Dapat diakses kendaraan pribadi melalui kawasan Tugu Pahlawan dan tersedia area parkir museum.'
  },
  nearbyDining: [
    { name: 'Rawon Setan', type: 'Kuliner sekitar', distance: '1 km' },
    { name: 'Pecel Sayur Pak Gendut', type: 'Kuliner sekitar', distance: '800 meter' },
    { name: 'Depot Lamongan Pak Jo', type: 'Kuliner sekitar', distance: '1,5 km' }
  ],
  nearbyFacilities: [
    { type: 'Stasiun', name: 'Stasiun Pasar Turi', distance: '800 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Taqwa Tugu Pahlawan', distance: '150 meter' },
    { type: 'SPBU', name: 'SPBU Pertamina Jl. Pahlawan', distance: '300 meter' },
    { type: 'ATM', name: 'ATM Mandiri & BCA', distance: '100 meter' },
    { type: 'Apotek', name: 'Apotek K24', distance: '400 meter' }
  ]
},
  {
  id: '2',
  name: 'Museum Surabaya (Siola)',
  slug: 'museum-surabaya-siola',
  heroImage: '',
  description: 'Museum kota yang menampilkan perjalanan sejarah, sosial, dan budaya Surabaya dari masa ke masa.',
  history: 'Terletak di gedung bersejarah Siola, museum ini menyajikan koleksi yang menggambarkan perkembangan Surabaya dari masa lampau hingga modern, lengkap dengan dokumentasi kota, benda bersejarah, serta narasi perkembangan sosial budaya Surabaya.',
  location: 'Jl. Tunjungan No.1, Genteng, Kec. Genteng, Surabaya, Jawa Timur 60275',
  mapEmbedUrl: 'https://maps.app.goo.gl/UBSdQ9cwc3ovCZ2e8',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 15:00 WIB' },
    { day: 'Senin', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't5', type: 'Tiket Masuk', price: 0, description: 'Gratis untuk semua pengunjung' }
  ],
  facilities: [
    'Spot foto instagramable',
    'Toilet Umum',
    'Mushola',
    'AC',
    'Tempat Parkir',
    'Guidebook'
  ],
transportation: {
    publicTransport: [
      'Bus rute S1, S2, M dengan turun di halte Siola lalu jalan kaki sekitar 2 menit',
      'WaraWiri rute kota pusat melalui halte Tunjungan',
      'Kereta KAI melalui Stasiun Pasar Turi dengan jarak sekitar 1,5 km ke museum'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Akses kendaraan pribadi mudah dari pusat kota Surabaya dan tersedia area parkir.'
  },
  nearbyDining: [
    { name: 'Kopi Tokoh', type: 'Kuliner sekitar', distance: '200 meter' },
    { name: 'Rawon Gajah Mada', type: 'Kuliner sekitar', distance: '400 meter' },
    { name: 'Es Tidar', type: 'Kuliner sekitar', distance: '300 meter' },
    { name: 'Bakso Ibu Sadiyah', type: 'Kuliner sekitar', distance: '600 meter' }
  ],
  nearbyFacilities: [
    { type: 'Pusat Belanja', name: 'Tunjungan Plaza Mall', distance: '200 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Al-Muhajirin Tunjungan', distance: '300 meter' },
    { type: 'SPBU', name: 'SPBU Shell', distance: '500 meter' },
    { type: 'Halte', name: 'Halte Siola / MPP Siola A', distance: '100 meter' }
  ]
},
  {
  id: '3',
  name: 'Museum H.O.S Tjokroaminoto',
  slug: 'museum-hos-tjokroaminoto',
  heroImage: '/images/museum_HOS_Cokroaminoto.jpg',
  description: 'Museum sejarah yang menempati rumah H.O.S. Tjokroaminoto, tokoh penting pergerakan nasional Indonesia.',
  history: 'Museum ini berada di rumah bersejarah tempat H.O.S. Tjokroaminoto tinggal bersama keluarganya. Tempat ini juga dikenal sebagai ruang tumbuh gagasan tokoh-tokoh besar bangsa, termasuk Soekarno muda.',
  location: 'Jl. Peneleh Gg. VII No.29-31, Peneleh, Kec. Genteng, Surabaya, Jawa Timur 60274',
  mapEmbedUrl: 'https://maps.app.goo.gl/B5Y9PAaWbpAqsLfN6',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 15:00 WIB' },
    { day: 'Senin', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't6', type: 'Umum', price: 5000, description: 'Tiket umum per orang' },
    { id: 't7', type: 'Wisatawan Asing', price: 15000, description: 'Tiket wisatawan asing per orang' },
    { id: 't8', type: 'Pelajar Luar Surabaya', price: 3000, description: 'Dengan identitas pelajar/mahasiswa' },
    { id: 't9', type: 'Pelajar Surabaya', price: 0, description: 'Gratis dengan menunjukkan kartu pelajar/mahasiswa yang masih berlaku' }
  ],
  facilities: [
    'Toilet Umum',
    'AC',
    'Ruang display foto dan dokumen',
    'Replika ruang keluarga Tjokroaminoto'
  ],
  transportation: {
    publicTransport: [
      'Bus rute DA, O, R1/R2, WK dengan turun di halte Alun-alun Contong lalu jalan kaki sekitar 5 menit',
      'WaraWiri rute kota pusat',
      'Kereta KAI melalui Stasiun Gubeng dengan jarak sekitar 3,6 km'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Dapat diakses kendaraan pribadi melalui kawasan Peneleh, dengan parkir menyesuaikan area sekitar museum.'
  },
  nearbyDining: [
    { name: 'Rawon Dapur', type: 'Kuliner sekitar', distance: '500 meter' },
    { name: 'Pecel Pak Kumis', type: 'Kuliner sekitar', distance: '400 meter' },
    { name: 'Es Campur Mbok Giyem', type: 'Kuliner sekitar', distance: '300 meter' },
    { name: 'Soto Ayam Pak Gendut', type: 'Kuliner sekitar', distance: '700 meter' }
  ],
  nearbyFacilities: [
    { type: 'Halte', name: 'Halte Alun-alun Contong', distance: '300 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Jami’ Peneleh', distance: '200 meter' },
    { type: 'Apotek', name: 'Apotek Kimia Farma Peneleh', distance: '400 meter' },
    { type: 'SPBU', name: 'SPBU Pertamina', distance: '800 meter' }
  ]
},
  {
  id: '4',
  name: 'Museum Olahraga Surabaya',
  slug: 'museum-olahraga-surabaya',
  heroImage: '',
  description: 'Museum yang menampilkan sejarah dan prestasi olahraga Surabaya dari berbagai cabang.',
  history: 'Museum ini menampilkan koleksi historika olahraga Surabaya seperti medali, trofi, jersey, dan berbagai artefak prestasi atlet. Ruang interaktif di lantai 1 dan 2 menambah pengalaman edukatif pengunjung.',
  location: 'Jl. Indragiri, Darmo, Kec. Wonokromo, Surabaya, Jawa Timur 60241',
  mapEmbedUrl: 'https://maps.app.goo.gl/43n3ijBkzohAvS7n9',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 15:00 WIB' },
    { day: 'Senin', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't10', type: 'Umum', price: 5000, description: 'Tiket umum per orang' },
    { id: 't11', type: 'Pelajar/Mahasiswa', price: 3000, description: 'Dengan identitas pelajar/mahasiswa' },
    { id: 't12', type: 'Mancanegara', price: 15000, description: 'Tiket wisatawan mancanegara' }
  ],
  facilities: [
    'Koleksi 169 historika olahraga',
    'Toilet Umum',
    'Mushola',
    'Tempat Parkir',
    'Ruang interaktif lantai 1-2'
  ],
  transportation: {
    publicTransport: [
      'Bus rute P11 dan P15 dengan turun di halte Gelora Pancasila lalu jalan kaki sekitar 5 menit',
      'WaraWiri rute Sawahan',
      'Kereta KAI melalui Stasiun Pasar Turi dengan jarak sekitar 4 km'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Akses kendaraan pribadi tersedia melalui kawasan THOR dan Gelora Pancasila, dengan area parkir museum.'
  },
  nearbyDining: [
    { name: 'Ayam Goreng Suharti', type: 'Kuliner sekitar', distance: '400 meter' },
    { name: 'Bakso Pak Kumis THOR', type: 'Kuliner sekitar', distance: '200 meter' },
    { name: 'Es Campur Pak Tono', type: 'Kuliner sekitar', distance: '500 meter' }
  ],
  nearbyFacilities: [
    { type: 'Lapangan', name: 'Lapangan THOR', distance: '200 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Al-Ikhlas Indragiri', distance: '300 meter' },
    { type: 'SPBU', name: 'SPBU Pertamina', distance: '700 meter' },
    { type: 'ATM', name: 'ATM BNI & BCA', distance: '150 meter' }
  ]
},
  {
  id: '5',
  name: 'Rumah Lahir Bung Karno',
  slug: 'rumah-lahir-bung-karno',
  heroImage: '',
  description: 'Rumah bersejarah tempat lahir Presiden pertama Republik Indonesia, Ir. Soekarno.',
  history: 'Rumah sederhana ini menjadi saksi bisu tempat lahirnya Ir. Soekarno. Museum ini menampilkan perjalanan keluarga Soekarno melalui video mapping dan teknologi AR yang memperkaya pengalaman edukatif pengunjung.',
  location: 'Jl. Pandean IV No.40, Peneleh, Kec. Genteng, Surabaya, Jawa Timur 60274',
  mapEmbedUrl: 'https://maps.app.goo.gl/TQNnJ977SedYNKww9',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 15:00 WIB' },
    { day: 'Senin', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't13', type: 'Tiket Masuk', price: 0, description: 'Gratis untuk semua pengunjung' }
  ],
  facilities: [
    'Video mapping perjalanan keluarga Soekarno',
    'Teknologi AR',
    'Toilet Umum',
    'Mushola',
    'Tempat Parkir terbatas'
  ],
  transportation: {
    publicTransport: [
      'Bus rute DA dan O dengan turun di halte Peneleh lalu jalan kaki sekitar 3 menit',
      'WaraWiri rute kota pusat',
      'Kereta KAI melalui Stasiun Gubeng dengan jarak sekitar 2,5 km'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Dapat diakses kendaraan pribadi, namun area parkir terbatas sehingga disarankan datang lebih awal.'
  },
  nearbyDining: [
    { name: 'Rawon Dapur Peneleh', type: 'Kuliner sekitar', distance: '300 meter' },
    { name: 'Soto Ayam Cak Kito', type: 'Kuliner sekitar', distance: '400 meter' },
    { name: 'Es Campur Mbok Giyem', type: 'Kuliner sekitar', distance: '200 meter' },
    { name: 'Pecel Tumpah Pak Kumis', type: 'Kuliner sekitar', distance: '500 meter' }
  ],
  nearbyFacilities: [
    { type: 'Halte', name: 'Halte Peneleh', distance: '200 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Jami’ Peneleh', distance: '300 meter' },
    { type: 'SPBU', name: 'SPBU Pertamina', distance: '800 meter' },
    { type: 'ATM', name: 'ATM Mandiri', distance: '150 meter' },
    { type: 'Apotek', name: 'Apotek Kimia Farma', distance: '400 meter' }
  ]
},
  {
  id: '6',
  name: 'Museum Dr. Soetomo',
  slug: 'museum-dr-soetomo',
  heroImage: '',
  description: 'Museum yang didedikasikan untuk mengenang perjuangan dan pemikiran Dr. Soetomo.',
  history: 'Museum ini menghadirkan kisah perjuangan Dr. Soetomo melalui galeri foto, lebih dari 300 artefak media, serta replika ruang praktik dokter yang menggambarkan kiprah beliau dalam dunia kebangsaan dan kesehatan.',
  location: 'Jl. Bubutan No.85-87, Bubutan, Kec. Bubutan, Surabaya, Jawa Timur 60174',
  mapEmbedUrl: 'https://maps.app.goo.gl/tvfihzzaedo7BxJM6',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 15:00 WIB' },
    { day: 'Senin', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't14', type: 'Umum', price: 5000, description: 'Tiket umum per orang' },
    { id: 't15', type: 'Wisatawan Asing', price: 15000, description: 'Tiket wisatawan asing per orang' },
    { id: 't16', type: 'Pelajar/Mahasiswa', price: 3000, description: 'Dengan identitas pelajar/mahasiswa' },
    { id: 't17', type: 'Pelajar Surabaya', price: 0, description: 'Gratis dengan menunjukkan kartu pelajar/mahasiswa yang masih berlaku' }
  ],
  facilities: [
    'Galeri foto dan 300+ artefak media',
    'Replika ruang praktik dokter',
    'AC',
    'Toilet Pria/Wanita',
    'Mushola',
    'Tempat Parkir',
    'Pendopo acara'
  ],
  transportation: {
    publicTransport: [
      'Bus rute BJ, D, DA, LMJ dengan turun di halte Tugu Pahlawan lalu jalan kaki sekitar 5 menit',
      'WaraWiri rute S1',
      'Kereta KAI melalui Stasiun Pasar Turi dengan jarak sekitar 1,5 km'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Akses kendaraan pribadi tersedia melalui kawasan Bubutan dan Tugu Pahlawan, dengan area parkir museum.'
  },
  nearbyDining: [
    { name: 'Rawon Setan Bubutan', type: 'Kuliner sekitar', distance: '500 meter' },
    { name: 'Pecel Bubutan', type: 'Kuliner sekitar', distance: '300 meter' },
    { name: 'Soto Ayam Cak Man', type: 'Kuliner sekitar', distance: '600 meter' },
    { name: 'Kopi Joss Tugu Pahlawan', type: 'Kuliner sekitar', distance: '400 meter' }
  ],
  nearbyFacilities: [
    { type: 'Halte', name: 'Halte Tugu Pahlawan', distance: '400 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Al-Akbar Surabaya', distance: '1 km' },
    { type: 'Apotek', name: 'Apotek K24 Bubutan', distance: '300 meter' },
    { type: 'SPBU', name: 'SPBU Pertamina', distance: '600 meter' },
    { type: 'Minimarket', name: 'Indomaret/Alfamart Jl. Bubutan', distance: '500 meter' },
    { type: 'Rumah Sakit', name: 'RSUD Dr. Soetomo', distance: '1 km' }
  ]
},
  {
  id: '7',
  name: 'Museum W.R. Soepratman',
  slug: 'museum-wr-soepratman',
  heroImage: '',
  description: 'Museum yang mengenang pencipta lagu kebangsaan Indonesia Raya, W.R. Soepratman.',
  history: 'Museum ini menampilkan ruang tamu keluarga W.R. Soepratman, replika biola, dan ruang rahasia anti-kolonial yang memperlihatkan semangat perjuangan melalui musik dan gagasan kebangsaan.',
  location: 'Jl. Mangga No.21, Tambaksari, Kec. Tambaksari, Surabaya, Jawa Timur 60136',
  mapEmbedUrl: 'https://maps.app.goo.gl/WpW7eHxwQo2KSncE6',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 15:00 WIB' },
    { day: 'Senin', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't18', type: 'Umum', price: 5000, description: 'Tiket umum per orang' },
    { id: 't19', type: 'Pelajar/Mahasiswa', price: 3000, description: 'Dengan identitas pelajar/mahasiswa' },
    { id: 't20', type: 'Mancanegara', price: 15000, description: 'Tiket wisatawan mancanegara' }
  ],
  facilities: [
    'Ruang tamu foto keluarga W.R. Soepratman',
    'Replika biola',
    'Kamar rahasia anti-kolonial',
    'Toilet Umum',
    'AC',
    'Tempat Parkir'
  ],
  transportation: {
    publicTransport: [
      'Bus rute 6, 15, P11 dengan turun di halte Mangga lalu jalan kaki sekitar 3 menit',
      'WaraWiri rute Tambaksari',
      'Kereta KAI melalui Stasiun Tambaksari dengan jarak sekitar 1 km'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Dapat diakses kendaraan pribadi melalui kawasan Tambaksari, dengan area parkir tersedia di sekitar museum.'
  },
  nearbyDining: [
    { name: 'Soto Ayam Cak Agus Tambaksari', type: 'Kuliner sekitar', distance: '300 meter' },
    { name: 'Rawon Pak Gembos', type: 'Kuliner sekitar', distance: '400 meter' },
    { name: 'Es Campur Pak Slamet', type: 'Kuliner sekitar', distance: '200 meter' },
    { name: 'Pecel Senggol Mangga', type: 'Kuliner sekitar', distance: '150 meter' }
  ],
  nearbyFacilities: [
    { type: 'Halte', name: 'Halte Mangga', distance: '200 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Jami’ Tambaksari', distance: '350 meter' },
    { type: 'Minimarket', name: 'Indomaret Gedang Sewu', distance: '100 meter' },
    { type: 'SPBU', name: 'SPBU Shell', distance: '700 meter' }
  ]
},
  {
  id: '8',
  name: 'Museum Pendidikan Surabaya',
  slug: 'museum-pendidikan-surabaya',
  heroImage: '',
  description: 'Museum edukatif yang menampilkan perkembangan sistem pendidikan di Indonesia.',
  history: 'Museum ini menghadirkan diorama replika kelas dari empat periode sejarah pendidikan, mulai dari masa pra-aksara hingga kemerdekaan, lengkap dengan ruang terbuka edukatif dan fasilitas ramah keluarga.',
  location: 'Jl. Genteng Kali No.10, Genteng, Kec. Genteng, Surabaya, Jawa Timur 60275',
  mapEmbedUrl: 'https://maps.app.goo.gl/TVJKa9RqCYL7T8m96',
  operatingHours: [
    { day: 'Selasa - Minggu', hours: '08:00 - 21:00 WIB' },
    { day: 'Senin', hours: 'Tutup' }
  ],
  tickets: [
    { id: 't21', type: 'Umum', price: 5000, description: 'Tiket umum per orang' },
    { id: 't22', type: 'Pelajar/Mahasiswa', price: 3000, description: 'Dengan identitas pelajar/mahasiswa' },
    { id: 't23', type: 'Mancanegara', price: 15000, description: 'Tiket wisatawan mancanegara' }
  ],
  facilities: [
    'Diorama replika kelas empat periode',
    'Taman terbuka',
    'Ruang laktasi',
    'Mushola',
    'Toilet anak dan dewasa',
    'Tempat Parkir',
    'AC'
  ],
  transportation: {
    publicTransport: [
      'Bus rute S1, S2, M dengan turun di halte Genteng Kali lalu jalan kaki sekitar 2 menit',
      'WaraWiri rute kota pusat',
      'Kereta KAI melalui Stasiun Pasar Turi dengan jarak sekitar 1,8 km'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, MyBluebird, dan Green SM.',
    privateVehicle: 'Akses kendaraan pribadi mudah melalui pusat kota Surabaya dengan area parkir museum.'
  },
  nearbyDining: [
    { name: 'Bakso President', type: 'Kuliner sekitar', distance: '500 meter' },
    { name: 'Rawon Gajah Mada', type: 'Kuliner sekitar', distance: '400 meter' },
    { name: 'Es Tidar', type: 'Kuliner sekitar', distance: '200 meter' },
    { name: 'Kopi Tokoh Genteng', type: 'Kuliner sekitar', distance: '250 meter' }
  ],
  nearbyFacilities: [
    { type: 'Halte', name: 'Halte Genteng Kali', distance: '150 meter' },
    { type: 'Tempat Ibadah', name: 'Masjid Al-Muhajirin', distance: '300 meter' },
    { type: 'Pusat Belanja', name: 'Tunjungan Plaza Mall', distance: '500 meter' },
    { type: 'SPBU', name: 'SPBU Shell', distance: '600 meter' },
    { type: 'Apotek', name: 'Apotek K24 Genteng', distance: '200 meter' }
  ]
},
  {
    id: '9',
    name: 'Museum Bank Indonesia Surabaya',
    slug: 'museum-bank-indonesia-surabaya',
    heroImage: '',
    description: 'Museum yang menampilkan sejarah perbankan dan sistem keuangan di Indonesia.',
    history: 'Bekas gedung bank sentral Hindia Belanda yang megah. Pengunjung diajak menelusuri sejarah perbankan, melihat mesin pencetak uang kuno, hingga masuk langsung ke area brankas.',
    location: 'Jl. Garuda No.1, Krembangan Sel., Kec. Krembangan, Surabaya, Jawa Timur 60175',
    mapEmbedUrl: '',
    operatingHours: [
      { day: 'Selasa - Minggu', hours: '08:00 - 16:00' },
      { day: 'Senin', hours: 'Tutup' }
    ],
    tickets: [
      { id: 't24', type: 'Tiket Masuk', price: 0, description: 'Gratis untuk semua pengunjung' }
    ],
    facilities: ['Galeri edukasi', 'Area pamer', 'Toilet', 'Area parkir', 'Belum diinput'],
    transportation: {
      publicTransport: ['Belum diinput'],
      ridehailing: 'Tersedia',
      privateVehicle: 'Akses kendaraan pribadi tersedia'
    },
    nearbyDining: [
      { name: 'Belum diinput', type: 'Kuliner sekitar', distance: 'Belum diinput' }
    ],
    nearbyFacilities: [
      { type: 'ATM', name: 'Belum diinput', distance: 'Belum diinput' }
    ]
  },

  {
    id: '10',
    name: 'House of Sampoerna',
    slug: 'house-of-sampoerna',
    heroImage: '',
    description: 'Museum tembakau dan sejarah industri kretek yang berada di bangunan kolonial ikonik Surabaya.',
    history: 'House of Sampoerna adalah museum tembakau dengan gaya arsitektur kolonial Belanda yang dibangun pada tahun 1862. Museum ini menampilkan sejarah awal industri kretek di Indonesia, koleksi keluarga Sampoerna, serta proses produksi tradisional.',
    location: 'Taman Jl. Sampoerna No.6, Krembangan Utara, Kec. Pabean Cantian, Surabaya, Jawa Timur 60163',
    mapEmbedUrl: '',
    operatingHours: [
      { day: 'Senin - Minggu', hours: '09:00 - 18:00' }
    ],
    tickets: [
      { id: 't25', type: 'Tiket Masuk', price: 0, description: 'Gratis, cukup menunjukkan identitas saat masuk' }
    ],
    facilities: ['Museum gallery', 'Souvenir shop', 'Kafe', 'Toilet', 'Area parkir'],
    transportation: {
      publicTransport: ['Belum diinput'],
      ridehailing: 'Tersedia - cari "House of Sampoerna"',
      privateVehicle: 'Akses kendaraan pribadi tersedia'
    },
    nearbyDining: [
      { name: 'Belum diinput', type: 'Kuliner sekitar', distance: 'Belum diinput' }
    ],
    nearbyFacilities: [
      { type: 'Parkir', name: 'Area parkir museum', distance: 'Di lokasi' }
    ]
  },

  {
    id: '11',
    name: 'Museum Kesehatan Dr. Adhyatma, MPH',
    slug: 'museum-kesehatan-dr-adhyatma',
    heroImage: '',
    description: 'Museum edukasi kesehatan yang menampilkan perkembangan dunia medis dan pengobatan tradisional.',
    history: 'Museum ini dikenal unik karena tidak hanya menampilkan sejarah alat kesehatan modern, tetapi juga pengobatan tradisional, supranatural, dan benda-benda yang dikaitkan dengan praktik pengobatan masa lalu.',
    location: 'Jl. Indrapura No.17, Kemayoran, Kec. Krembangan, Surabaya, Jawa Timur 60176',
    mapEmbedUrl: '',
    operatingHours: [
      { day: 'Senin - Jumat', hours: '08:00 - 16:00' },
      { day: 'Sabtu - Minggu', hours: 'Belum diinput' }
    ],
    tickets: [
      { id: 't26', type: 'Umum', price: 1500, description: 'Pembelian tiket langsung di lokasi' }
    ],
    facilities: ['Galeri kesehatan', 'Toilet', 'Area edukasi', 'Belum diinput'],
    transportation: {
      publicTransport: ['Belum diinput'],
      ridehailing: 'Tersedia',
      privateVehicle: 'Akses kendaraan pribadi tersedia'
    },
    nearbyDining: [
      { name: 'Belum diinput', type: 'Kuliner sekitar', distance: 'Belum diinput' }
    ],
    nearbyFacilities: [
      { type: 'Apotek', name: 'Belum diinput', distance: 'Belum diinput' }
    ]
  },

  {
    id: '12',
    name: 'Museum Kanker Indonesia',
    slug: 'museum-kanker-indonesia',
    heroImage: '',
    description: 'Museum edukasi yang berfokus pada kanker, pencegahan, dan deteksi dini.',
    history: 'Museum ini menampilkan anatomi, spesimen sel kanker, dan informasi penting tentang pencegahan serta deteksi dini kanker. Cocok sebagai media edukasi kesehatan masyarakat.',
    location: 'Jl. Kayoon No.16-18, Embong Kaliasin, Kec. Genteng, Surabaya, Jawa Timur 60271',
    mapEmbedUrl: '',
    operatingHours: [
      { day: 'Senin - Minggu', hours: '08:00 - 20:00' }
    ],
    tickets: [
      { id: 't27', type: 'Hari Biasa', price: 0, description: 'Gratis untuk semua pengunjung' },
      { id: 't28', type: 'Akhir Pekan', price: 5000, description: 'Daftar di buku tamu saat tiba' }
    ],
    facilities: ['Area edukasi', 'Toilet', 'Belum diinput'],
    transportation: {
      publicTransport: ['Belum diinput'],
      ridehailing: 'Tersedia',
      privateVehicle: 'Akses kendaraan pribadi tersedia'
    },
    nearbyDining: [
      { name: 'Belum diinput', type: 'Kuliner sekitar', distance: 'Belum diinput' }
    ],
    nearbyFacilities: [
      { type: 'Rumah Sakit', name: 'Belum diinput', distance: 'Belum diinput' }
    ]
  },

  {
    id: '13',
    name: 'Museum TNI Loka Jala Crana',
    slug: 'museum-tni-loka-jala-crana',
    heroImage: '',
    description: 'Museum militer maritim yang menampilkan sejarah dan koleksi TNI Angkatan Laut.',
    history: 'Museum ini berada di kawasan Akademi Angkatan Laut (AAL) Bumimoro dan menyimpan koleksi sejarah pertempuran laut Nusantara, meriam, tank amfibi, serta berbagai sarana TNI AL.',
    location: 'Akademi TNI Angkatan Laut, Jl. Moro Krembangan, Bumimoro, Kec. Krembangan, Surabaya, Jawa Timur 60178',
    mapEmbedUrl: '',
    operatingHours: [
      { day: 'Senin - Sabtu', hours: '08:00 - 14:00' },
      { day: 'Minggu', hours: 'Tutup / Belum diinput' }
    ],
    tickets: [
      { id: 't29', type: 'Umum', price: 2000, description: 'Kunjungan langsung dengan daftar di lokasi' }
    ],
    facilities: ['Galeri militer', 'Area edukasi', 'Toilet', 'Belum diinput'],
    transportation: {
      publicTransport: ['Belum diinput'],
      ridehailing: 'Tersedia',
      privateVehicle: 'Akses kendaraan pribadi tersedia'
    },
    nearbyDining: [
      { name: 'Belum diinput', type: 'Kuliner sekitar', distance: 'Belum diinput' }
    ],
    nearbyFacilities: [
      { type: 'Area Militer', name: 'Kompleks AAL', distance: 'Di lokasi' }
    ]
  },

  {
  id: '14',
  name: 'Monumen Kapal Selam',
  slug: 'monumen-kapal-selam',
  heroImage: '',
  description: 'Monumen dan museum kapal selam asli KRI Pasopati 410 yang pernah digunakan TNI AL.',
  history: 'Monumen Kapal Selam menampilkan pengalaman eksplorasi KRI Pasopati 410, lengkap dengan wahana video rama, area kolam renang, stand makanan, serta suasana wisata edukatif maritim di pusat kota Surabaya.',
  location: 'Jl. Pemuda No.39, Embong Kaliasin, Kec. Genteng, Surabaya, Jawa Timur 60271',
  mapEmbedUrl: 'https://maps.app.goo.gl/9bFUuin3GZhWM66C7',
  operatingHours: [
    { day: 'Senin - Minggu', hours: '08:00 - 21:00 WIB' }
  ],
  tickets: [
    { id: 't30', type: 'Umum', price: 15000, description: 'Tiket umum per orang' },
    { id: 't30b', type: 'Mancanegara', price: 25000, description: 'Tiket wisatawan mancanegara per orang' },
    { id: 't30c', type: 'Anak di bawah 1 meter', price: 0, description: 'Gratis untuk anak dengan tinggi di bawah 1 meter' }
  ],
  facilities: [
    'Eksplorasi Kapal Selam KRI Pasopati 410',
    'Video Rama',
    'Kolam Renang',
    'Parkir Luas',
    'Stand Makanan',
    'Toilet Umum',
    'Tempat Ibadah'
  ],
  transportation: {
    publicTransport: [
      'Suroboyo Bus rute R1 dari Terminal Purabaya lalu turun di Halte Urip Kaliasin dan lanjut jalan kaki sekitar 1,2 km'
    ],
    ridehailing: 'Tersedia melalui aplikasi GOJEK, GRAB, Maxim, MyBluebird, dan Green SM.',
    privateVehicle: 'Akses kendaraan pribadi tersedia di kawasan pusat kota Surabaya dengan area parkir luas.'
  },
  nearbyDining: [
    { name: 'Sate Kelopo Ondomohen Bu Asih', type: 'Kuliner sekitar', distance: '1,2 km' },
    { name: 'Historica', type: 'Kuliner sekitar', distance: '500 meter' }
  ],
  nearbyFacilities: [
    { type: 'Stasiun', name: 'Stasiun Surabaya Gubeng', distance: '500 meter' },
    { type: 'Pusat Belanja', name: 'Plaza Surabaya', distance: '260 meter' },
    { type: 'Rumah Sakit', name: 'Rumah Sakit Umum Siloam Surabaya', distance: '1,3 km' },
    { type: 'Rumah Sakit', name: 'Rumah Sakit Dr. Soetomo', distance: '2,5 km' },
    { type: 'Ruang Publik', name: 'Alun-Alun Surabaya', distance: '650 meter' }
  ]
},
  {
    id: '15',
    name: 'De Mata Trick Eye Museum',
    slug: 'de-mata-trick-eye-museum',
    heroImage: '',
    description: 'Museum seni ilusi optik dan foto 3D interaktif.',
    history: 'Museum ini berisi berbagai koleksi seni ilusi optik 3D dengan tema olahraga, alam, binatang, angka, romansa, pahlawan, sirkus, dan lain-lain. Data lokasi pada dokumen menunjukkan alamat di luar Surabaya sehingga perlu dicek ulang sebelum final.',
    location: 'Jl. Veteran No.150-151, Pandeyan, Umbulharjo, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55161',
    mapEmbedUrl: '',
    operatingHours: [
      { day: 'Senin - Minggu', hours: '10:00 - 22:00' }
    ],
    tickets: [
      { id: 't31', type: 'Senin - Kamis', price: 25000, description: 'Tiket weekday' },
      { id: 't32', type: 'Jumat - Minggu', price: 35000, description: 'Tiket weekend' }
    ],
    facilities: ['Spot foto 3D', 'Toilet', 'Belum diinput'],
    transportation: {
      publicTransport: ['Belum diinput'],
      ridehailing: 'Tersedia',
      privateVehicle: 'Belum diinput'
    },
    nearbyDining: [
      { name: 'Belum diinput', type: 'Kuliner sekitar', distance: 'Belum diinput' }
    ],
    nearbyFacilities: [
      { type: 'Catatan', name: 'Perlu verifikasi apakah museum ini akan tetap dipakai di project', distance: '-' }
    ]
  },

  {
    id: '16',
    name: 'Monumen Jalesveva Jayamahe',
    slug: 'monumen-jalesveva-jayamahe',
    heroImage: '',
    description: 'Monumen maritim ikonik Surabaya yang menjadi simbol kejayaan armada laut Indonesia.',
    history: 'Ikon maritim Surabaya berupa patung raksasa Perwira TNI AL setinggi sekitar 30 meter yang menghadap laut di kawasan ujung Pelabuhan Tanjung Perak. Menjadi simbol kekuatan dan kejayaan maritim Indonesia.',
    location: 'Armada Timur Ujung, Ujung, Kec. Semampir, Kota Surabaya, Jawa Timur',
    mapEmbedUrl: '',
    operatingHours: [
      { day: 'Senin - Jumat', hours: '08:00 - 18:00' },
      { day: 'Sabtu - Minggu', hours: 'Belum diinput' }
    ],
    tickets: [
      { id: 't33', type: 'Tiket Masuk', price: 0, description: 'Gratis untuk semua pengunjung' }
    ],
    facilities: ['Area landmark', 'Belum diinput'],
    transportation: {
      publicTransport: ['Belum diinput'],
      ridehailing: 'Tersedia',
      privateVehicle: 'Akses kendaraan pribadi tersedia'
    },
    nearbyDining: [
      { name: 'Warung Bahari Nusantara', type: 'Seafood & Kuliner Laut', distance: '450m' },
      { name: 'Belum diinput', type: 'Kuliner sekitar', distance: 'Belum diinput' }
    ],
    nearbyFacilities: [
      { type: 'Pelabuhan', name: 'Area Tanjung Perak', distance: 'Dekat lokasi' },
      { type: 'ATM', name: 'Belum diinput', distance: 'Belum diinput' }
    ]
  }
];

export const tourGuides: TourGuide[] = [
  {
    id: 'g1',
    name: 'Rizky Aditya Pratama',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    languages: ['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Belanda'],
    specialties: ['Tur Sejarah Kolonial', 'Arsitektur Kolonial', 'Sejarah Hindia Belanda'],
    rating: 4.9,
    reviews: 48,
    pricePerHour: 125000,
    availability: getUpcomingDates([0, 1, 2, 4, 6, 8]),
    gender: 'Laki-laki',
    age: 34,
    description:
      'Spesialis sejarah Hindia Belanda dan arsitektur kolonial di Surabaya. Ia terbiasa memandu wisatawan lokal maupun mancanegara untuk menelusuri jejak bangunan bersejarah, kawasan kota lama, dan cerita perkembangan Surabaya pada masa kolonial.',
    quote: 'Membawa masa lalu ke masa kini melalui kisah nyata.',
    mainMuseums: ['Museum Surabaya (Siola)', 'House of Sampoerna', 'Museum Bank Indonesia Surabaya'],
    reviewList: [
      {
        id: 'r1',
        userName: 'Andini',
        rating: 5,
        comment: 'Penjelasannya detail sekali dan cara bicaranya enak diikuti.',
        date: '2026-04-12',
      },
      {
        id: 'r2',
        userName: 'Rama',
        rating: 5,
        comment: 'Cocok untuk tur sejarah, banyak insight yang tidak saya tahu sebelumnya.',
        date: '2026-04-15',
      },
      {
        id: 'r3',
        userName: 'Claudia',
        rating: 4,
        comment: 'Sangat informatif, terutama saat menjelaskan arsitektur bangunan lama.',
        date: '2026-04-18',
      },
    ],
  },
  {
    id: 'g2',
    name: 'Nadira Safira Wulandari',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    languages: ['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Jepang'],
    specialties: ['Tur Seni & Budaya', 'Seni Rupa', 'Artefak Budaya Nusantara'],
    rating: 4.8,
    reviews: 41,
    pricePerHour: 120000,
    availability: getUpcomingDates([0, 2, 3, 5, 7, 9]),
    gender: 'Perempuan',
    age: 29,
    description:
      'Pengamat seni dan budaya lokal yang berpengalaman. Nadira piawai menjelaskan koleksi seni rupa, artefak budaya Nusantara, dan nilai simbolik di balik benda-benda museum dengan pendekatan storytelling yang ringan dan menarik.',
    quote: 'Seni adalah bahasa universal yang menyatukan jiwa.',
    mainMuseums: ['Museum Surabaya (Siola)', 'Museum Pendidikan Surabaya', 'Museum Sepuluh Nopember'],
    reviewList: [
      {
        id: 'r4',
        userName: 'Siska',
        rating: 5,
        comment: 'Cara menjelaskan koleksi museum sangat hidup dan tidak membosankan.',
        date: '2026-04-09',
      },
      {
        id: 'r5',
        userName: 'Kenji',
        rating: 4,
        comment: 'Ramah dan komunikatif, terutama untuk tur keluarga.',
        date: '2026-04-13',
      },
      {
        id: 'r6',
        userName: 'Farel',
        rating: 5,
        comment: 'Bagus untuk pengunjung yang suka seni dan budaya lokal.',
        date: '2026-04-17',
      },
    ],
  },
  {
    id: 'g3',
    name: 'Budi Santoso Hadipranoto',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    languages: ['Bahasa Indonesia', 'Bahasa Jawa (Krama & Ngoko)', 'Bahasa Inggris'],
    specialties: ['Tur Warisan Budaya Jawa', 'Filosofi Jawa', 'Budaya Jawa Timur'],
    rating: 4.9,
    reviews: 56,
    pricePerHour: 140000,
    availability: getUpcomingDates([1, 2, 4, 6, 8, 10]),
    gender: 'Laki-laki',
    age: 52,
    description:
      'Budayawan senior dan pecinta tradisi Jawa. Budi memiliki pengetahuan mendalam mengenai filosofi Jawa, simbol budaya, aksara, dan nilai-nilai luhur masyarakat Jawa Timur yang membuat pengalaman tur terasa lebih kaya.',
    quote: 'Akar yang kuat menumbuhkan pohon yang tinggi.',
    mainMuseums: ['Museum Pendidikan Surabaya', 'Museum H.O.S Tjokroaminoto', 'Museum Dr. Soetomo'],
    reviewList: [
      {
        id: 'r7',
        userName: 'Naufal',
        rating: 5,
        comment: 'Pemandunya sangat berwawasan dan penyampaiannya berkelas.',
        date: '2026-04-08',
      },
      {
        id: 'r8',
        userName: 'Dewi',
        rating: 5,
        comment: 'Saya suka sekali penjelasan tentang filosofi budaya Jawa.',
        date: '2026-04-14',
      },
      {
        id: 'r9',
        userName: 'Tiara',
        rating: 4,
        comment: 'Materinya kuat dan cocok untuk wisata edukasi.',
        date: '2026-04-19',
      },
    ],
  },
  {
    id: 'g4',
    name: 'Sri Wulandari',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    languages: ['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Mandarin', 'Bahasa Hokkien'],
    specialties: ['Tur Edukasi & Sains', 'Museum Pendidikan', 'Peradaban Tionghoa-Jawa'],
    rating: 4.8,
    reviews: 37,
    pricePerHour: 130000,
    availability: getUpcomingDates([0, 1, 3, 5, 7, 10]),
    gender: 'Perempuan',
    age: 27,
    description:
      'Pendidik muda yang fokus pada wisata edukatif untuk pelajar dan keluarga. Sri sangat cocok untuk kunjungan sekolah, tur keluarga, dan penjelasan lintas budaya, khususnya pada tema sains, pendidikan, dan peradaban Tionghoa-Jawa.',
    quote: 'Belajar paling baik dimulai dari rasa ingin tahu.',
    mainMuseums: ['Museum Kesehatan dr. Adhyatma', 'Klenteng Hok An Kiong', 'Museum Pendidikan Surabaya'],
    reviewList: [
      {
        id: 'r10',
        userName: 'Maya',
        rating: 5,
        comment: 'Bagus sekali untuk anak-anak dan keluarga.',
        date: '2026-04-10',
      },
      {
        id: 'r11',
        userName: 'Jason',
        rating: 4,
        comment: 'Penjelasannya sabar dan mudah dipahami.',
        date: '2026-04-16',
      },
      {
        id: 'r12',
        userName: 'Lina',
        rating: 5,
        comment: 'Sangat cocok untuk tur edukatif sekolah.',
        date: '2026-04-18',
      },
    ],
  },
  {
    id: 'g5',
    name: 'Farhan Hakim Al-Rasyid',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    languages: ['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Arab'],
    specialties: ['Tur Sejarah Islam & Religi', 'Sejarah Islam Nusantara', 'Budaya Religi Jawa Timur'],
    rating: 4.9,
    reviews: 44,
    pricePerHour: 135000,
    availability: getUpcomingDates([0, 2, 4, 5, 7, 9]),
    gender: 'Laki-laki',
    age: 41,
    description:
      'Peneliti sejarah Islam di Nusantara dan pemandu wisata religi berpengalaman. Farhan ahli dalam menjelaskan jalur penyebaran Islam di Jawa Timur, tradisi keagamaan lokal, serta hubungan sejarah religius dengan perkembangan budaya masyarakat Surabaya.',
    quote: 'Semua di dunia ini adalah milik Allah.',
    mainMuseums: ['Museum Sepuluh Nopember', 'Museum H.O.S Tjokroaminoto', 'Kawasan Religi Ampel'],
    reviewList: [
      {
        id: 'r13',
        userName: 'Aisyah',
        rating: 5,
        comment: 'Sangat mendalam dan menenangkan saat membawakan tur religi.',
        date: '2026-04-11',
      },
      {
        id: 'r14',
        userName: 'Rizal',
        rating: 5,
        comment: 'Penjelasannya runtut dan relevan dengan sejarah Islam Nusantara.',
        date: '2026-04-15',
      },
      {
        id: 'r15',
        userName: 'Hanif',
        rating: 4,
        comment: 'Bagus untuk pengunjung yang ingin tur sejarah dan religi sekaligus.',
        date: '2026-04-19',
      },
    ],
  },
];


export const products: Product[] = [
  {
    id: 'p1',
    name: 'Kaos Museum',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    price: 85000,
    category: 'Pakaian',
    museum: 'Museum House of Sampoerna',
    description: 'Merchandise museum belum diinput secara lengkap.',
    stock: 20
  },
  {
    id: 'p2',
    name: 'Totebag Museum',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=500&fit=crop',
    price: 65000,
    category: 'Aksesori',
    museum: 'Monumen Kapal Selam',
    description: 'Merchandise museum belum diinput secara lengkap.',
    stock: 15
  },
  {
    id: 'p3',
    name: 'Mug Edisi Museum',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
    price: 50000,
    category: 'Peralatan Minum',
    museum: 'Museum Sepuluh Nopember',
    description: 'Merchandise museum belum diinput secara lengkap.',
    stock: 30
  },
  {
    id: 'p4',
    name: 'Buku Koleksi Museum',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
    price: 120000,
    category: 'Buku',
    museum: 'Museum Mpu Tantular',
    description: 'Merchandise museum belum diinput secara lengkap.',
    stock: 12
  }
];

export const mockUser: User = {
  id: 'u1',
  email: 'user@memora.id',
  name: 'Pengguna Tamu',
  phone: '+62 812-3456-7890',
  role: 'user'
};