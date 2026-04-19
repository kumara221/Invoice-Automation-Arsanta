const APP_CONFIG = {
  admins: {
    Haidar: {
      name: "Haidar Fikri",
      paymentInfo: {
        type: "text",
        lines: [
          "Arsanta Creative",
          "Bank: BNI (a.n. Haidar Fikri Surya Putra)",
          "No. Rek: 0253827099"
        ]
      }
    },

    Reza: {
      name: "Reza",
      paymentInfo: {
        type: "text",
        lines: [
          "Arsanta Creative",
          "Bank: CIMB (a.n. Reza Syaifullah Narendra)",
          "No. Rek: 763437949200"
        ]
      }
    },

    Abiyyu: {
      name: "Abiyyu",
      paymentInfo: {
        type: "qris_with_text",
        qrisImage: "assets/qris-abiyyu.png",
        qrisLabel: "QRIS",
        lines: [
          "Arsanta Creative",
          "Bank: Mandiri (a.n. Abiyyu Kumara Nayottama)",
          "No. Rek: 1460016901428"
        ]
      }
    }
  },

  itemOptions: [
    { id: "package-60", label: "Package 60's", type: "normal", defaultPrice: 325000 },
    { id: "package-70", label: "Package 70's", type: "normal", defaultPrice: 375000 },
    { id: "package-80", label: "Package 80's", type: "normal", defaultPrice: 425000 },
    { id: "package-80+", label: "Package 80's+", type: "normal", defaultPrice: 449000 },
    { id: "package-90", label: "Package 90's", type: "normal", defaultPrice: 449000 },
    { id: "package-120", label: "Package 120's", type: "normal", defaultPrice: 549000 },
    { id: "extra-time-split-time", label: "Add On - Split Time", type: "normal", defaultPrice: 50000 },
    { id: "extra-time-30", label: "Add On - Extra Time (30 menit)", type: "normal", defaultPrice: 50000 },
    { id: "extra-edit-foto", label: "Add On - Extra Edit Foto (10 foto)", type: "normal", defaultPrice: 25000 },
    { id: "extra-family-90s", label: "Add On - Family 90's", type: "normal", defaultPrice: 200000 }, 
    { id: "extra-video-reels", label: "Extra Video Reels (1 Menit)", type: "normal", defaultPrice: 200000 },
    { id: "extra-video-reels", label: "Extra Video Cinematik (2-3 Menit)", type: "normal", defaultPrice: 300000 },
    { id: "promo", label: "Promo", type: "adjustment" },
    { id: "dp", label: "DP", type: "adjustment" }
  ]
  
};