import { PrismaClient, BetType, BetStatus, Side, EntityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clear existing data to avoid duplicates on re-runs
  await prisma.bet.deleteMany();

  const betsData = [
    // 1) Odegaard vs Bruno - Most Assists
    {
      slug: "odegaard-vs-fernandes-most-assists-2025-2026",
      title: "Odegaard vs Bruno - Most Assists (2025-2026)",
      type: BetType.player_v_player,
      league: "Premier League",
      season: "2025-2026",
      criteria_text: "Martin Odegaard vs Bruno Fernandes for most assists in the Premier League 2025-2026 season. Straight comparison of total assists. Premier League only.",
      prize: "Winner receives one jersey or teamwear item.",
      status: BetStatus.active,
      participants: {
        create: [
          { display_name: "Mitch", side: Side.a },
          { display_name: "Shiv", side: Side.b }
        ]
      },
      entities: {
        create: [
          { entity_type: EntityType.player, label: "Martin Odegaard", side: Side.a },
          { entity_type: EntityType.player, label: "Bruno Fernandes", side: Side.b }
        ]
      }
    },
    // 2) Zirkzee vs Madueke - Most G/A
    {
      slug: "zirkzee-vs-madueke-most-ga-2025-2026",
      title: "Zirkzee vs Madueke - Most G/A (2025-2026)",
      type: BetType.player_v_player,
      league: "Premier League",
      season: "2025-2026",
      criteria_text: "Joshua Zirkzee vs Noni Madueke for most combined goals + assists across Premier League, Carabao Cup, and FA Cup in the 2025-2026 season. Minutes played are ignored. Bet is void if one player has two months more injury time than the other.",
      prize: "Prize to be decided.",
      status: BetStatus.active,
      participants: {
        create: [
          { display_name: "Mitch", side: Side.a }, // Backs Madueke (a)
          { display_name: "Shiv", side: Side.b }  // Backs Zirkzee (b)
        ]
      },
      entities: {
        create: [
          { entity_type: EntityType.player, label: "Noni Madueke", side: Side.a },
          { entity_type: EntityType.player, label: "Joshua Zirkzee", side: Side.b }
        ]
      }
    },
    // 3) Zirkzee vs Cherki - Most G/A
    {
      slug: "zirkzee-vs-cherki-most-ga-2025-2026",
      title: "Zirkzee vs Cherki - Most G/A (2025-2026)",
      type: BetType.player_v_player,
      league: "Premier League",
      season: "2025-2026",
      criteria_text: "Joshua Zirkzee vs Rayan Cherki for most combined goals + assists across Premier League, Carabao Cup, and FA Cup in the 2025-2026 season. Minutes played are ignored. Bet is void if one player has two months more injury than the other.",
      prize: "Shiv owes one sleeve of Nespresso pods. Diogo owes one espresso bean coffee bag.",
      status: BetStatus.active,
      participants: {
        create: [
          { display_name: "Shiv", side: Side.a }, // Backs Zirkzee (a)
          { display_name: "Diogo", side: Side.b } // Backs Cherki (b)
        ]
      },
      entities: {
        create: [
          { entity_type: EntityType.player, label: "Joshua Zirkzee", side: Side.a },
          { entity_type: EntityType.player, label: "Rayan Cherki", side: Side.b }
        ]
      }
    },
    // 4) Frimpong vs Nunes - Highest Avg FotMob Rating
    {
      slug: "frimpong-vs-nunes-fotmob-rating-2025-2026",
      title: "Frimpong vs Nunes - Highest Avg FotMob Rating (2025-2026)",
      type: BetType.player_v_player,
      league: "Premier League",
      season: "2025-2026",
      criteria_text: "Jeremie Frimpong vs Matheus Nunes for highest average FotMob rating across the 2025-2026 season. Minimum 25 matches played required for the rating to qualify. If either player plays fewer than 25 matches, the bet is void.",
      prize: "Prize to be decided.",
      status: BetStatus.active,
      participants: {
        create: [
          { display_name: "Shiv", side: Side.a }, // Backs Frimpong (a)
          { display_name: "Diogo", side: Side.b } // Backs Nunes (b)
        ]
      },
      entities: {
        create: [
          { entity_type: EntityType.player, label: "Jeremie Frimpong", side: Side.a },
          { entity_type: EntityType.player, label: "Matheus Nunes", side: Side.b }
        ]
      }
    },
    // 5) Matheus Cunha - Hits 20 Non Penalty G/A
    {
      slug: "matheus-cunha-20-np-ga-2025-2026",
      title: "Matheus Cunha - Hits 20 Non-Penalty G/A (2025-2026)",
      type: BetType.player_threshold,
      league: "Premier League",
      season: "2025-2026",
      criteria_text: "Matheus Cunha to reach 20 non-penalty goals + assists in the Premier League 2025-2026 season. Only Premier League counts. Penalties do not count. Bet is void if Cunha suffers two injuries that total 12 or more weeks.",
      prize: "Winner receives a pack of 12 golf balls of their choice from a reputable retail store.",
      status: BetStatus.active,
      participants: {
        create: [
          { display_name: "Shiv", side: Side.a },  // Wins if yes
          { display_name: "Diogo", side: Side.b }, // Wins if no
          { display_name: "Mitch", side: Side.b }  // Wins if no
        ]
      },
      entities: {
        create: [
          { entity_type: EntityType.player, label: "Matheus Cunha", side: Side.a }
        ]
      }
    }
  ];

  for (const bet of betsData) {
    const createdBet = await prisma.bet.create({
      data: bet,
    });
    console.log(`Created bet with id: ${createdBet.id} (${createdBet.title})`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });