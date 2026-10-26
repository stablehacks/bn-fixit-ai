import { Surreal } from 'surrealdb';

let surrealInstance: Surreal | null = null;
let isConnected = false;

export async function getSurrealDb(): Promise<Surreal | null> {
  const url = process.env.SURREALDB_URL;
  if (!url) {
    return null;
  }

  if (surrealInstance && isConnected) {
    return surrealInstance;
  }

  try {
    const db = new Surreal();
    await db.connect(url);

    const user = process.env.SURREALDB_USER;
    const pass = process.env.SURREALDB_PASS;
    if (user && pass) {
      await db.signin({
        username: user,
        password: pass,
      });
    }

    const ns = process.env.SURREALDB_NS || 'fixit_ai';
    const database = process.env.SURREALDB_DB || 'production';
    await db.use({ namespace: ns, database: database });

    surrealInstance = db;
    isConnected = true;
    console.log(`[SurrealDB] Successfully connected to ${url} (ns: ${ns}, db: ${database})`);
    return db;
  } catch (err) {
    console.warn('[SurrealDB] Connection to external instance failed, using local adapter:', err);
    isConnected = false;
    return null;
  }
}

export function isSurrealLive(): boolean {
  return isConnected;
}

export const SURREAL_SCHEMA_DEFINITION = `
-- FIXIT AI SURREALDB SCHEMA SPECIFICATION
DEFINE NAMESPACE fixit_ai;
DEFINE DATABASE production;

DEFINE TABLE organization SCHEMAFULL;
DEFINE FIELD name ON organization TYPE string;
DEFINE FIELD created_at ON organization TYPE datetime;

DEFINE TABLE property SCHEMAFULL;
DEFINE FIELD organization_id ON property TYPE string;
DEFINE FIELD name ON property TYPE string;
DEFINE FIELD address ON property TYPE string;
DEFINE FIELD unit_count ON property TYPE number;
DEFINE FIELD created_at ON property TYPE datetime;

DEFINE TABLE maintenance_request SCHEMAFULL;
DEFINE FIELD organization_id ON maintenance_request TYPE string;
DEFINE FIELD property_id ON maintenance_request TYPE string;
DEFINE FIELD unit_number ON maintenance_request TYPE string;
DEFINE FIELD category ON maintenance_request TYPE string;
DEFINE FIELD description ON maintenance_request TYPE string;
DEFINE FIELD urgency ON maintenance_request TYPE string;
DEFINE FIELD status ON maintenance_request TYPE string;
DEFINE FIELD ai_triage ON maintenance_request TYPE option<object>;
DEFINE FIELD created_at ON maintenance_request TYPE datetime;

DEFINE TABLE contractor SCHEMAFULL;
DEFINE FIELD organization_id ON contractor TYPE string;
DEFINE FIELD name ON contractor TYPE string;
DEFINE FIELD company ON contractor TYPE string;
DEFINE FIELD service_categories ON contractor TYPE array;
DEFINE FIELD service_area ON contractor TYPE string;
DEFINE FIELD active ON contractor TYPE bool;

DEFINE TABLE work_order SCHEMAFULL;
DEFINE FIELD organization_id ON work_order TYPE string;
DEFINE FIELD request_id ON work_order TYPE string;
DEFINE FIELD contractor_id ON work_order TYPE option<string>;
DEFINE FIELD priority ON work_order TYPE string;
DEFINE FIELD status ON work_order TYPE string;
DEFINE FIELD created_at ON work_order TYPE datetime;

DEFINE TABLE agent_memory SCHEMAFULL;
DEFINE FIELD organization_id ON agent_memory TYPE string;
DEFINE FIELD property_id ON agent_memory TYPE string;
DEFINE FIELD unit_number ON agent_memory TYPE string;
DEFINE FIELD summary ON agent_memory TYPE string;
DEFINE FIELD details ON agent_memory TYPE string;
DEFINE FIELD memory_type ON agent_memory TYPE string;
DEFINE FIELD created_at ON agent_memory TYPE datetime;

DEFINE TABLE audit_event SCHEMAFULL;
DEFINE FIELD organization_id ON audit_event TYPE string;
DEFINE FIELD actor_type ON audit_event TYPE string;
DEFINE FIELD actor_id ON audit_event TYPE string;
DEFINE FIELD event_type ON audit_event TYPE string;
DEFINE FIELD created_at ON audit_event TYPE datetime;
`;
