import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import {
  db,
  pool,
  appointmentsTable,
  doctorsTable,
  medicalHistoryTable,
  usersTable,
} from "@workspace/db";

const BCRYPT_ROUNDS = 10;

function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** Next 7 calendar days in Asia/Karachi: morning + evening blocks per day */
function buildAvailabilitySlots(): string[] {
  const slots: string[] = [];
  const fmtDay = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Karachi",
  });
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayStr = fmtDay.format(d);
    slots.push(`${dayStr} · 09:00–12:00 (Morning)`);
    slots.push(`${dayStr} · 17:00–20:00 (Evening)`);
  }
  return slots;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function resetTables(): Promise<void> {
  await db.execute(
    sql`TRUNCATE TABLE medical_history, appointments, doctors, users RESTART IDENTITY CASCADE`,
  );
}

async function main(): Promise<void> {
  console.log("Seeding SmartClinic demo data (Pakistan)…");
  await resetTables();

  const [adminHash, patientHash, doctorHash] = await Promise.all([
    hashPassword("admin123"),
    hashPassword("patient123"),
    hashPassword("doctor123"),
  ]);

  await db.insert(usersTable).values([
    {
      name: "Zara Khan",
      email: "zara@smartclinic.com",
      passwordHash: adminHash,
      role: "admin",
    },
    {
      name: "Wania Mateen",
      email: "wania@gmail.com",
      passwordHash: patientHash,
      role: "patient",
    },
    {
      name: "Ali Hassan",
      email: "ali@gmail.com",
      passwordHash: patientHash,
      role: "patient",
    },
    {
      name: "Sara Ahmed",
      email: "sara@gmail.com",
      passwordHash: patientHash,
      role: "patient",
    },
    {
      name: "Dr. Ahmed Raza",
      email: "ahmed.raza@smartclinic.com",
      passwordHash: doctorHash,
      role: "doctor",
    },
    {
      name: "Dr. Fatima Malik",
      email: "fatima.malik@smartclinic.com",
      passwordHash: doctorHash,
      role: "doctor",
    },
    {
      name: "Dr. Hassan Siddiqui",
      email: "hassan.siddiqui@smartclinic.com",
      passwordHash: doctorHash,
      role: "doctor",
    },
    {
      name: "Dr. Ayesha Noor",
      email: "ayesha.noor@smartclinic.com",
      passwordHash: doctorHash,
      role: "doctor",
    },
    {
      name: "Dr. Bilal Chaudhry",
      email: "bilal.chaudhry@smartclinic.com",
      passwordHash: doctorHash,
      role: "doctor",
    },
    {
      name: "Dr. Sana Iqbal",
      email: "sana.iqbal@smartclinic.com",
      passwordHash: doctorHash,
      role: "doctor",
    },
  ]);

  const availability = buildAvailabilitySlots();

  const doctorRows = [
    {
      name: "Dr. Ahmed Raza",
      specialty: "Cardiologist",
      qualification:
        "MBBS (King Edward Medical University), FCPS (Cardiology). Bio: Consultant cardiologist in Lahore with 14 years of experience in hypertension, ischemic heart disease, and post–heart-attack rehabilitation; fluent in Urdu and English.",
      experience: 14,
      fee: 4500,
      availableTimes: availability,
      rating: 4.8,
      totalPatients: 1820,
    },
    {
      name: "Dr. Fatima Malik",
      specialty: "Gynecologist",
      qualification:
        "MBBS, FCPS (Obstetrics & Gynaecology). Bio: Women’s health specialist focusing on antenatal care, high-risk pregnancy, and minimally invasive procedures; 12 years of practice in Karachi and Islamabad.",
      experience: 12,
      fee: 4000,
      availableTimes: availability,
      rating: 4.9,
      totalPatients: 2100,
    },
    {
      name: "Dr. Hassan Siddiqui",
      specialty: "Dermatologist",
      qualification:
        "MBBS, MCPS (Dermatology). Bio: Dermatologist treating acne, eczema, psoriasis, and cosmetic concerns; 10 years of experience with emphasis on evidence-based skin care in South Asian climates.",
      experience: 10,
      fee: 3500,
      availableTimes: availability,
      rating: 4.7,
      totalPatients: 1540,
    },
    {
      name: "Dr. Ayesha Noor",
      specialty: "Pediatrician",
      qualification:
        "MBBS, FCPS (Paediatrics). Bio: Child health specialist covering growth, vaccination schedules, and childhood infections; warm, family-centred approach over 9 years in Rawalpindi.",
      experience: 9,
      fee: 3000,
      availableTimes: availability,
      rating: 4.85,
      totalPatients: 1980,
    },
    {
      name: "Dr. Bilal Chaudhry",
      specialty: "Orthopedic Surgeon",
      qualification:
        "MBBS, FCPS (Orthopaedic Surgery). Bio: Orthopaedic surgeon with focus on sports injuries, joint pain, and fracture care; 16 years including work at tertiary-care centres in Punjab.",
      experience: 16,
      fee: 5000,
      availableTimes: availability,
      rating: 4.75,
      totalPatients: 1420,
    },
    {
      name: "Dr. Sana Iqbal",
      specialty: "General Physician",
      qualification:
        "MBBS, MRCP (UK). Bio: General physician managing diabetes, thyroid disorders, infections, and preventive health; 11 years of primary-care experience across urban clinics in Pakistan.",
      experience: 11,
      fee: 2500,
      availableTimes: availability,
      rating: 4.65,
      totalPatients: 2600,
    },
  ] as const;

  const insertedDoctors = await db
    .insert(doctorsTable)
    .values([...doctorRows])
    .returning({ id: doctorsTable.id, name: doctorsTable.name, specialty: doctorsTable.specialty, fee: doctorsTable.fee });

  const byName = Object.fromEntries(insertedDoctors.map((d) => [d.name, d])) as Record<
    string,
    { id: number; name: string; specialty: string; fee: number }
  >;

  const today = new Date();
  const daysAgo = (n: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() - n);
    return ymd(x);
  };
  const daysFromNow = (n: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + n);
    return ymd(x);
  };

  await db.insert(appointmentsTable).values([
    {
      doctorId: byName["Dr. Ahmed Raza"].id,
      doctorName: "Dr. Ahmed Raza",
      specialty: "Cardiologist",
      date: daysAgo(21),
      time: "10:30 AM",
      reason: "Chest tightness on exertion; blood pressure review.",
      status: "completed",
      fee: byName["Dr. Ahmed Raza"].fee,
    },
    {
      doctorId: byName["Dr. Fatima Malik"].id,
      doctorName: "Dr. Fatima Malik",
      specialty: "Gynecologist",
      date: daysAgo(14),
      time: "11:00 AM",
      reason: "Routine antenatal check-up (2nd trimester).",
      status: "completed",
      fee: byName["Dr. Fatima Malik"].fee,
    },
    {
      doctorId: byName["Dr. Sana Iqbal"].id,
      doctorName: "Dr. Sana Iqbal",
      specialty: "General Physician",
      date: daysAgo(7),
      time: "06:00 PM",
      reason: "Follow-up for type 2 diabetes and medication adjustment.",
      status: "completed",
      fee: byName["Dr. Sana Iqbal"].fee,
    },
    {
      doctorId: byName["Dr. Hassan Siddiqui"].id,
      doctorName: "Dr. Hassan Siddiqui",
      specialty: "Dermatologist",
      date: daysFromNow(1),
      time: "10:00 AM",
      reason: "Chronic eczema flare; patch test discussion.",
      status: "upcoming",
      fee: byName["Dr. Hassan Siddiqui"].fee,
    },
    {
      doctorId: byName["Dr. Ayesha Noor"].id,
      doctorName: "Dr. Ayesha Noor",
      specialty: "Pediatrician",
      date: daysFromNow(2),
      time: "05:30 PM",
      reason: "Child fever and cough; vaccination schedule review.",
      status: "upcoming",
      fee: byName["Dr. Ayesha Noor"].fee,
    },
    {
      doctorId: byName["Dr. Bilal Chaudhry"].id,
      doctorName: "Dr. Bilal Chaudhry",
      specialty: "Orthopedic Surgeon",
      date: daysFromNow(4),
      time: "09:30 AM",
      reason: "Knee pain after running; possible meniscus strain.",
      status: "upcoming",
      fee: byName["Dr. Bilal Chaudhry"].fee,
    },
  ]);

  await db.insert(medicalHistoryTable).values([
    {
      doctorName: "Dr. Ahmed Raza",
      specialty: "Cardiologist",
      date: daysAgo(21),
      diagnosis:
        "Essential hypertension, Grade 1; atypical chest pain — musculoskeletal vs. angina ruled out with normal ECG in clinic.",
      prescription:
        "Amlodipine 5 mg OD; lifestyle counselling (low salt, regular walk). Cardiology follow-up in 4 weeks.",
      notes:
        "Patient reports stress from work. Advised BP log at home. No family history of early MI.",
    },
    {
      doctorName: "Dr. Fatima Malik",
      specialty: "Gynecologist",
      date: daysAgo(14),
      diagnosis:
        "Uncomplicated singleton pregnancy, 24 weeks; mild iron-deficiency trend on recent labs.",
      prescription:
        "Iron + folic acid supplementation; dietary advice (lean meat, lentils, citrus with meals).",
      notes:
        "Fetal movements normal. Next growth scan scheduled. Discussed birth-preparedness and hospital bag.",
    },
    {
      doctorName: "Dr. Sana Iqbal",
      specialty: "General Physician",
      date: daysAgo(7),
      diagnosis:
        "Type 2 diabetes mellitus — fair control; dyslipidaemia borderline.",
      prescription:
        "Continue metformin; add atorvastatin 10 mg HS; HbA1c repeat in 3 months.",
      notes:
        "Patient walking 25 minutes daily. Counseled on portion sizes and Ramadan planning if applicable.",
    },
  ]);

  console.log("Seed complete: admin, 6 doctors (+ logins), 3 patients, appointments, medical history.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
