# Migration notes

The original project was a Next.js wallet/airdrop prototype backed by an in-memory Express array. That shape was not appropriate for a real-estate business website.

Removed from the product architecture:
- wallet connection
- ethers.js
- airdrop join flow
- Telegram/Discord bot logic
- mining/reward concepts
- in-memory user storage

Added:
- property and estate catalogues
- enquiry/lead capture
- CMS-driven site content
- PostgreSQL/Prisma persistence
- session-based admin authentication
- property/estate CRUD
- content and journal APIs
- responsive luxury public UI
- admin control centre

The design direction is premium and editorial: deep green, warm gold, cream backgrounds, large serif display typography, immersive property photography and generous spacing. It borrows category conventions from premium real-estate sites without copying another company's content or branding.
