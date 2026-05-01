import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear existing data
    await db.order.deleteMany()
    await db.product.deleteMany()
    await db.admin.deleteMany()
    await db.setting.deleteMany()
    await db.testimonial.deleteMany()
    await db.banner.deleteMany()

    // Create default admin
    const admin = await db.admin.create({
      data: {
        username: 'admin',
        password: Buffer.from('admin123').toString('base64'),
      },
    })

    // Create default settings
    await db.setting.createMany({
      data: [
        { key: 'tripay_api_key', value: 'DEV-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
        { key: 'tripay_merchant_code', value: 'T0001' },
        { key: 'tripay_private_key', value: 'xxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxx' },
        { key: 'store_name', value: 'GameVault Store' },
        { key: 'store_description', value: 'Your trusted digital game store' },
        { key: 'whatsapp_number', value: '6281234567890' },
      ],
    })

    // Create sample products
    await db.product.createMany({
      data: [
        {
          name: 'Elden Ring',
          description: 'Rise, Tarnished. The Golden Order has been broken. Journey through the Lands Between in this acclaimed action RPG from FromSoftware and George R.R. Martin. Explore an interconnected world full of mystery, danger, and discovery.',
          shortDesc: 'Open world action RPG by FromSoftware',
          price: 250000,
          image: 'https://picsum.photos/seed/eldenring/400/550',
          downloadLink: 'https://example.com/downloads/elden-ring',
          category: 'rpg',
          featured: true,
        },
        {
          name: 'Cyberpunk 2077',
          description: 'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped in a fight for survival. Customize your character and playstyle as you take on jobs, build street cred, and unlock upgrades.',
          shortDesc: 'Open world cyberpunk action RPG',
          price: 200000,
          image: 'https://picsum.photos/seed/cyberpunk2077/400/550',
          downloadLink: 'https://example.com/downloads/cyberpunk-2077',
          category: 'rpg',
          featured: true,
        },
        {
          name: 'God of War Ragnarök',
          description: 'Embark on an epic and heartfelt journey through the nine realms as Kratos and Atreus face the impending Ragnarök. Combat, puzzle-solving, and an unforgettable narrative await in this critically acclaimed sequel.',
          shortDesc: 'Norse mythology action adventure',
          price: 280000,
          image: 'https://picsum.photos/seed/godofwarragnarok/400/550',
          downloadLink: 'https://example.com/downloads/god-of-war-ragnarok',
          category: 'action',
          featured: true,
        },
        {
          name: 'Red Dead Redemption 2',
          description: 'America, 1899. Arthur Morgan and the Van der Linde gang are on the run. With federal agents and the best bounty hunters in the nation massing on their heels, the gang must rob, steal, and fight their way across the rugged heartland of America.',
          shortDesc: 'Open world Western adventure',
          price: 180000,
          image: 'https://picsum.photos/seed/reddeadredemption2/400/550',
          downloadLink: 'https://example.com/downloads/rdr2',
          category: 'action',
          featured: false,
        },
        {
          name: 'Hogwarts Legacy',
          description: 'Live the Unwritten. Hogwarts Legacy is an immersive, open-world action RPG set in the world first introduced in the Harry Potter books. Experience Hogwarts in the 1800s and uncover its hidden secrets.',
          shortDesc: 'Open world Harry Potter RPG',
          price: 220000,
          image: 'https://picsum.photos/seed/hogwartslegacy/400/550',
          downloadLink: 'https://example.com/downloads/hogwarts-legacy',
          category: 'rpg',
          featured: true,
        },
        {
          name: "Baldur's Gate 3",
          description: "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival. Baldur's Gate 3 is a story-rich, party-based RPG set in the universe of Dungeons & Dragons.",
          shortDesc: 'Story-rich D&D party-based RPG',
          price: 300000,
          image: 'https://picsum.photos/seed/baldursgate3/400/550',
          downloadLink: 'https://example.com/downloads/baldurs-gate-3',
          category: 'rpg',
          featured: true,
        },
        {
          name: 'The Witcher 3 Complete Edition',
          description: 'As war rages, Geralt of Rivia must find the Child of Prophecy — the living weapon that can alter the shape of the world. Includes all expansions: Hearts of Stone and Blood and Wine.',
          shortDesc: 'Award-winning open world RPG with all DLC',
          price: 120000,
          image: 'https://picsum.photos/seed/witcher3/400/550',
          downloadLink: 'https://example.com/downloads/witcher-3',
          category: 'rpg',
          featured: false,
        },
        {
          name: 'Grand Theft Auto V',
          description: 'Experience the award-winning Grand Theft Auto V and Grand Theft Auto Online. Explore the sprawling world of Los Santos and Blaine County in the ultimate open-world adventure.',
          shortDesc: 'Open world crime adventure',
          price: 150000,
          image: 'https://picsum.photos/seed/gtav/400/550',
          downloadLink: 'https://example.com/downloads/gta-v',
          category: 'action',
          featured: false,
        },
      ],
    })

    // Create sample testimonials
    await db.testimonial.createMany({
      data: [
        {
          name: 'Ahmad Rizky',
          text: 'Proses pengiriman sangat cepat! Game langsung bisa di-download setelah pembayaran dikonfirmasi. Sangat recommended!',
          rating: 5,
          avatar: 'https://picsum.photos/seed/avatar1/100/100',
        },
        {
          name: 'Dewi Lestari',
          text: 'Harga game jauh lebih murah dibanding toko lain. Customer service juga sangat responsif dan membantu.',
          rating: 5,
          avatar: 'https://picsum.photos/seed/avatar2/100/100',
        },
        {
          name: 'Budi Santoso',
          text: 'Sudah berlangganan beli game di sini selama 6 bulan. Tidak pernah mengecewakan! Koleksi game lengkap dan update.',
          rating: 4,
          avatar: 'https://picsum.photos/seed/avatar3/100/100',
        },
        {
          name: 'Siti Nurhaliza',
          text: 'Awalnya ragu beli game digital, tapi ternyata mudah dan aman. Link download selalu bekerja dengan baik.',
          rating: 5,
          avatar: 'https://picsum.photos/seed/avatar4/100/100',
        },
      ],
    })

    // Create sample banners
    await db.banner.createMany({
      data: [
        {
          imageUrl: 'https://picsum.photos/seed/banner1/1200/400',
          title: '🔥 Mega Sale Weekend!',
          subtitle: 'Diskon hingga 50% untuk game-game pilihan. Berlaku sampai akhir minggu!',
          active: true,
          order: 1,
        },
        {
          imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
          title: '🎮 New Releases',
          subtitle: 'Game terbaru tersedia sekarang! Dapatkan sekarang juga.',
          active: true,
          order: 2,
        },
        {
          imageUrl: 'https://picsum.photos/seed/banner3/1200/400',
          title: '⭐ Top Rated Games',
          subtitle: 'Koleksi game dengan rating tertinggi sepanjang masa.',
          active: true,
          order: 3,
        },
      ],
    })

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        admin: admin.username,
        products: 8,
        testimonials: 4,
        banners: 3,
        settings: 6,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    )
  }
}
