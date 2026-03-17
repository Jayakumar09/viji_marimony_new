# Fields Comparison - 2026-03-17

This document compares the field definitions across three key files:
1. **Database Fields** (`backend/prisma/database_fields.js`) - Prisma Schema fields
2. **Profile Fields** (`backend/controllers/profile_fields.js`) - Profile controller fields (getProfile, getMe)
3. **Admin Fields** (`backend/controllers/admin_fields.js`) - Admin controller fields (getAllUsers)

## Field Comparison Table

| S.No | Field Name | Database | Profile | Admin |
|------|------------|----------|---------|-------|
| 1 | id | ✓ | ✓ | ✓ |
| 2 | customId | ✓ | ✓ | ✓ |
| 3 | email | ✓ | ✓ | ✓ |
| 4 | password | ✓ | - | - |
| 5 | phone | ✓ | ✓ | ✓ |
| 6 | firstName | ✓ | ✓ | ✓ |
| 7 | lastName | ✓ | ✓ | ✓ |
| 8 | gender | ✓ | ✓ | ✓ |
| 9 | dateOfBirth | ✓ | ✓ | ✓ |
| 10 | age | ✓ | ✓ | ✓ |
| 11 | community | ✓ | ✓ | ✓ |
| 12 | subCaste | ✓ | ✓ | ✓ |
| 13 | city | ✓ | ✓ | ✓ |
| 14 | state | ✓ | ✓ | ✓ |
| 15 | country | ✓ | ✓ | ✓ |
| 16 | education | ✓ | ✓ | ✓ |
| 17 | profession | ✓ | ✓ | ✓ |
| 18 | income | ✓ | ✓ | ✓ |
| 19 | maritalStatus | ✓ | ✓ | ✓ |
| 20 | height | ✓ | ✓ | ✓ |
| 21 | weight | ✓ | ✓ | ✓ |
| 22 | complexion | ✓ | ✓ | ✓ |
| 23 | physicalStatus | ✓ | ✓ | ✓ |
| 24 | drinkingHabit | ✓ | ✓ | ✓ |
| 25 | smokingHabit | ✓ | ✓ | ✓ |
| 26 | diet | ✓ | ✓ | ✓ |
| 27 | profilePhoto | ✓ | ✓ | ✓ |
| 28 | profilePhotoScale | ✓ | ✓ | ✓ |
| 29 | profilePhotoX | ✓ | ✓ | ✓ |
| 30 | profilePhotoY | ✓ | ✓ | ✓ |
| 31 | photos | ✓ | ✓ | ✓ |
| 32 | bio | ✓ | ✓ | ✓ |
| 33 | familyValues | ✓ | ✓ | ✓ |
| 34 | familyType | ✓ | ✓ | ✓ |
| 35 | familyStatus | ✓ | ✓ | ✓ |
| 36 | aboutFamily | ✓ | ✓ | ✓ |
| 37 | isVerified | ✓ | ✓ | ✓ |
| 38 | isPremium | ✓ | ✓ | ✓ |
| 39 | isActive | ✓ | ✓ | ✓ |
| 40 | emailVerified | ✓ | ✓ | ✓ |
| 41 | phoneVerified | ✓ | ✓ | ✓ |
| 42 | photosVerified | ✓ | ✓ | ✓ |
| 43 | lastLoginAt | ✓ | ✓ | ✓ |
| 44 | createdAt | ✓ | ✓ | ✓ |
| 45 | updatedAt | ✓ | ✓ | ✓ |
| 46 | raasi | ✓ | ✓ | ✓ |
| 47 | natchathiram | ✓ | ✓ | ✓ |
| 48 | dhosam | ✓ | ✓ | ✓ |
| 49 | birthDate | ✓ | ✓ | ✓ |
| 50 | birthTime | ✓ | ✓ | ✓ |
| 51 | birthPlace | ✓ | ✓ | ✓ |
| 52 | fatherName | ✓ | ✓ | ✓ |
| 53 | fatherOccupation | ✓ | ✓ | ✓ |
| 54 | fatherCaste | ✓ | ✓ | ✓ |
| 55 | motherName | ✓ | ✓ | ✓ |
| 56 | motherOccupation | ✓ | ✓ | ✓ |
| 57 | motherCaste | ✓ | ✓ | ✓ |
| 58 | subscriptionTier | ✓ | ✓ | ✓ |
| 59 | successFee | ✓ | ✓ | ✓ |
| 60 | subscriptionStart | ✓ | ✓ | ✓ |
| 61 | subscriptionEnd | ✓ | ✓ | ✓ |
| 62 | manualVerificationStatus | ✓ | ✓ | ✓ |
| 63 | manualVerificationNotes | ✓ | ✓ | ✓ |
| 64 | profileVerificationStatus | ✓ | ✓ | ✓ |
| 65 | profileVerified | ✓ | ✓ | ✓ |

## Summary

| Category | Database | Profile | Admin |
|----------|----------|---------|-------|
| **Total Fields** | 66 | 65 | 65 |
| **Basic Info** | 12 | 11 | 11 |
| **Location** | 3 | 3 | 3 |
| **Education & Work** | 3 | 3 | 3 |
| **Personal Details** | 5 | 5 | 5 |
| **Habits** | 3 | 3 | 3 |
| **Photos** | 5 | 5 | 5 |
| **About** | 1 | 1 | 1 |
| **Family** | 4 | 4 | 4 |
| **Verification Status** | 7 | 7 | 7 |
| **Timestamps** | 2 | 2 | 2 |
| **Horoscope Fields** | 6 | 6 | 6 |
| **Family Background** | 6 | 6 | 6 |
| **Subscription** | 4 | 4 | 4 |
| **Manual Verification** | 2 | 2 | 2 |
| **Profile Verification** | 2 | 2 | 2 |

## Notes

- **Database Fields** includes `password` field which is not exposed in API responses
- **Profile Fields** and **Admin Fields** are identical - both return 65 fields
- All three files share the same field structure with minor differences in exposure

## Field Categories Breakdown

### Basic Info (12 fields)
- id, customId, email, password (DB only), phone, firstName, lastName, gender, dateOfBirth, age, community, subCaste

### Location (3 fields)
- city, state, country

### Education & Work (3 fields)
- education, profession, income

### Personal Details (5 fields)
- maritalStatus, height, weight, complexion, physicalStatus

### Habits (3 fields)
- drinkingHabit, smokingHabit, diet

### Photos (5 fields)
- profilePhoto, profilePhotoScale, profilePhotoX, profilePhotoY, photos

### About (1 field)
- bio

### Family (4 fields)
- familyValues, familyType, familyStatus, aboutFamily

### Verification Status (7 fields)
- isVerified, isPremium, isActive, emailVerified, phoneVerified, photosVerified, lastLoginAt

### Timestamps (2 fields)
- createdAt, updatedAt

### Horoscope Fields (6 fields)
- raasi, natchathiram, dhosam, birthDate, birthTime, birthPlace

### Family Background (6 fields)
- fatherName, fatherOccupation, fatherCaste, motherName, motherOccupation, motherCaste

### Subscription (4 fields)
- subscriptionTier, successFee, subscriptionStart, subscriptionEnd

### Manual Verification (2 fields)
- manualVerificationStatus, manualVerificationNotes

### Profile Verification (2 fields)
- profileVerificationStatus, profileVerified
