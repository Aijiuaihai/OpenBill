use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct AppSettings {
    mode: Option<String>,
    active_user_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LocalUser {
    id: String,
    name: String,
    kind: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Transaction {
    id: String,
    amount: f64,
    #[serde(rename = "type")]
    transaction_type: String,
    category: String,
    channel: String,
    note: Option<String>,
    date: String,
    created_at: String,
    updated_at: String,
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir().map_err(|error| error.to_string())?;
    fs::create_dir_all(&app_dir).map_err(|error| error.to_string())?;
    Ok(app_dir.join("openbill.sqlite3"))
}

fn connection(app: &AppHandle) -> Result<Connection, String> {
    let conn = Connection::open(database_path(app)?).map_err(|error| error.to_string())?;
    initialize_database(&conn)?;
    Ok(conn)
}

fn initialize_database(conn: &Connection) -> Result<(), String> {
    conn.execute_batch(
        "
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          kind TEXT NOT NULL CHECK (kind IN ('guest', 'local')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          amount REAL NOT NULL CHECK (amount > 0),
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          category TEXT NOT NULL,
          channel TEXT NOT NULL,
          note TEXT,
          date TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_user_date
          ON transactions(user_id, date DESC, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_type
          ON transactions(user_id, type);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_channel
          ON transactions(user_id, channel);
        CREATE INDEX IF NOT EXISTS idx_transactions_user_category
          ON transactions(user_id, category);
        ",
    )
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn load_settings(app: AppHandle) -> Result<AppSettings, String> {
    let conn = connection(&app)?;
    let raw = conn
        .query_row(
            "SELECT value FROM settings WHERE key = 'app'",
            [],
            |row| row.get::<_, String>(0),
        )
        .optional()
        .map_err(|error| error.to_string())?;

    match raw {
        Some(value) => serde_json::from_str(&value).map_err(|error| error.to_string()),
        None => Ok(AppSettings::default()),
    }
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let conn = connection(&app)?;
    let value = serde_json::to_string(&settings).map_err(|error| error.to_string())?;
    conn.execute(
        "
        INSERT INTO settings (key, value)
        VALUES ('app', ?1)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        ",
        params![value],
    )
    .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_users(app: AppHandle) -> Result<Vec<LocalUser>, String> {
    let conn = connection(&app)?;
    let mut statement = conn
        .prepare(
            "
            SELECT id, name, kind, created_at, updated_at
            FROM users
            ORDER BY created_at ASC
            ",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map([], |row| {
            Ok(LocalUser {
                id: row.get(0)?,
                name: row.get(1)?,
                kind: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_users(app: AppHandle, users: Vec<LocalUser>) -> Result<(), String> {
    let mut conn = connection(&app)?;
    let tx = conn.transaction().map_err(|error| error.to_string())?;
    let incoming_ids = users
        .iter()
        .map(|user| user.id.clone())
        .collect::<Vec<_>>();

    {
        let mut existing_statement = tx
            .prepare("SELECT id FROM users")
            .map_err(|error| error.to_string())?;
        let existing_ids = existing_statement
            .query_map([], |row| row.get::<_, String>(0))
            .map_err(|error| error.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|error| error.to_string())?;

        for existing_id in existing_ids {
            if !incoming_ids.contains(&existing_id) {
                tx.execute("DELETE FROM users WHERE id = ?1", params![existing_id])
                    .map_err(|error| error.to_string())?;
            }
        }
    }

    for user in users {
        tx.execute(
            "
            INSERT INTO users (id, name, kind, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              kind = excluded.kind,
              updated_at = excluded.updated_at
            ",
            params![
                user.id,
                user.name,
                user.kind,
                user.created_at,
                user.updated_at
            ],
        )
        .map_err(|error| error.to_string())?;
    }

    tx.commit().map_err(|error| error.to_string())
}

#[tauri::command]
fn load_transactions(app: AppHandle, user_id: String) -> Result<Vec<Transaction>, String> {
    let conn = connection(&app)?;
    let mut statement = conn
        .prepare(
            "
            SELECT id, amount, type, category, channel, note, date, created_at, updated_at
            FROM transactions
            WHERE user_id = ?1
            ORDER BY date DESC, created_at DESC
            ",
        )
        .map_err(|error| error.to_string())?;

    let rows = statement
        .query_map(params![user_id], |row| {
            Ok(Transaction {
                id: row.get(0)?,
                amount: row.get(1)?,
                transaction_type: row.get(2)?,
                category: row.get(3)?,
                channel: row.get(4)?,
                note: row.get(5)?,
                date: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|error| error.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_transactions(
    app: AppHandle,
    user_id: String,
    transactions: Vec<Transaction>,
) -> Result<(), String> {
    let mut conn = connection(&app)?;
    let tx = conn.transaction().map_err(|error| error.to_string())?;
    tx.execute("DELETE FROM transactions WHERE user_id = ?1", params![user_id])
        .map_err(|error| error.to_string())?;

    for transaction in transactions {
        tx.execute(
            "
            INSERT INTO transactions (
              id, user_id, amount, type, category, channel, note, date, created_at, updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            ",
            params![
                transaction.id,
                &user_id,
                transaction.amount,
                transaction.transaction_type,
                transaction.category,
                transaction.channel,
                transaction.note,
                transaction.date,
                transaction.created_at,
                transaction.updated_at
            ],
        )
        .map_err(|error| error.to_string())?;
    }

    tx.commit().map_err(|error| error.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_settings,
            save_settings,
            load_users,
            save_users,
            load_transactions,
            save_transactions
        ])
        .run(tauri::generate_context!())
        .expect("error while running OpenBill");
}
