import sqlite3
import json
import os
from datetime import datetime

MEMORY_DB = "memory.db"

def init_db():
    """Initializes the database with all required tables."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    
    # --- Memory Tables ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS core_memories (
            id INTEGER PRIMARY KEY,
            memory TEXT NOT NULL UNIQUE,
            timestamp TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS general_memories (
            id INTEGER PRIMARY KEY,
            memory TEXT NOT NULL UNIQUE,
            timestamp TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS special_memories (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            memory TEXT NOT NULL UNIQUE,
            timestamp TEXT NOT NULL
        )
    ''')

    # --- Conversation Buffer Table ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_buffer (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'unread'
        )
    ''')

    # --- Daily Summaries Table ---
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            summary TEXT NOT NULL,
            tips TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()

# Call init_db() on module load
init_db()

# --- Summary Functions ---
def get_today_summary(date: str):
    """Fetches the summary for a specific date."""
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT summary, tips FROM daily_summaries WHERE date = ?", (date,))
    summary = cursor.fetchone()
    conn.close()
    return dict(summary) if summary else None

def upsert_today_summary(date: str, summary: str, tips: str):
    """Inserts or updates the summary for a specific date."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO daily_summaries (date, summary, tips) VALUES (?, ?, ?) ON CONFLICT(date) DO UPDATE SET summary = excluded.summary, tips = excluded.tips",
            (date, summary, tips)
        )
        conn.commit()
    finally:
        conn.close()

# --- Buffer Functions ---

def add_to_buffer(sender: str, message: str):
    """Adds a message to the conversation buffer."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    try:
        cursor.execute(
            "INSERT INTO conversation_buffer (timestamp, sender, message) VALUES (?, ?, ?)",
            (timestamp, sender, message)
        )
        conn.commit()
    finally:
        conn.close()

def get_unread_buffer():
    """Fetches all unread messages from the buffer, ordered by timestamp."""
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, sender, message FROM conversation_buffer WHERE status = 'unread' ORDER BY timestamp ASC")
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return messages

def delete_processed_buffer(ids):
    """Deletes processed messages from the buffer by their IDs."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    try:
        cursor.executemany("DELETE FROM conversation_buffer WHERE id = ?", [(id,) for id in ids])
        conn.commit()
    finally:
        conn.close()


def load_memories_core(table="core_memories"):
    """Loads all memories from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(f"SELECT memory, timestamp FROM {table} ORDER BY timestamp DESC")
    memories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return memories

def load_memories_general(table="general_memories"):
    """Loads all memories from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(f"SELECT memory, timestamp FROM {table} ORDER BY timestamp DESC")
    memories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return memories

def load_memories_special(table="special_memories"):
    """Loads all memories from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(f"SELECT title, memory, timestamp FROM {table} ORDER BY timestamp DESC")
    memories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return memories

def get_relevant_memories_core(query, table="core_memories", k=20):
    """Retrieves the most relevant memories using keyword matching from the specified table."""
    if not query:
        return []

    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query_words = query.lower().split()
    search_clauses = [f"memory LIKE ?" for _ in query_words]
    sql_query = f"SELECT memory, timestamp FROM {table} WHERE {' OR '.join(search_clauses)}"
    like_params = [f"%{word}%" for word in query_words]

    cursor.execute(sql_query, like_params)
    results = cursor.fetchall()
    conn.close()

    if not results:
        return []

    query_word_set = set(query_words)
    scored_memories = []

    for row in results:
        memory_words = set(row['memory'].lower().split())
        score = len(query_word_set.intersection(memory_words))
        if score > 0:
            scored_memories.append({"score": score, "memory": dict(row)})

    scored_memories.sort(key=lambda x: x["score"], reverse=True)
    return [item["memory"] for item in scored_memories[:k]]


def get_relevant_memories_general(query, table="general_memories", k=20):
    """Retrieves the most relevant memories using keyword matching from the specified table."""
    if not query:
        return []

    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query_words = query.lower().split()
    search_clauses = [f"memory LIKE ?" for _ in query_words]
    sql_query = f"SELECT memory, timestamp FROM {table} WHERE {' OR '.join(search_clauses)}"
    like_params = [f"%{word}%" for word in query_words]

    cursor.execute(sql_query, like_params)
    results = cursor.fetchall()
    conn.close()

    if not results:
        return []

    query_word_set = set(query_words)
    scored_memories = []

    for row in results:
        memory_words = set(row['memory'].lower().split())
        score = len(query_word_set.intersection(memory_words))
        if score > 0:
            scored_memories.append({"score": score, "memory": dict(row)})

    scored_memories.sort(key=lambda x: x["score"], reverse=True)
    return [item["memory"] for item in scored_memories[:k]]

def get_relevant_special_memories_core(query, table="special_memories", k=20):
    """Retrieves the most relevant special memories using keyword matching from the specified table."""
    if not query:
        return []

    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query_words = query.lower().split()
    search_clauses = [f"memory LIKE ?" for _ in query_words]
    sql_query = f"SELECT memory, timestamp FROM {table} WHERE {' OR '.join(search_clauses)}"
    like_params = [f"%{word}%" for word in query_words]

    cursor.execute(sql_query, like_params)
    results = cursor.fetchall()
    conn.close()

    if not results:
        return []

    query_word_set = set(query_words)
    scored_memories = []

    for row in results:
        memory_words = set(row['memory'].lower().split())
        score = len(query_word_set.intersection(memory_words))
        if score > 0:
            scored_memories.append({"score": score, "memory": dict(row)})

    scored_memories.sort(key=lambda x: x["score"], reverse=True)
    return [item["memory"] for item in scored_memories[:k]]


def add_memory_core(memory_text, table="core_memories"):
    """Adds a new, unique memory to the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    was_added = False
    try:
        cursor.execute(f"INSERT OR IGNORE INTO {table} (memory, timestamp) VALUES (?, ?)", (memory_text, timestamp))
        conn.commit()
        was_added = cursor.rowcount > 0
    except sqlite3.IntegrityError:
        was_added = False
    finally:
        conn.close()
    return was_added

def add_special_memory_core(memory_text, title, table="special_memories"):
    """Adds a new, unique memory to the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    was_added = False
    try:
        cursor.execute(f"INSERT OR IGNORE INTO {table} (title, memory, timestamp) VALUES (?, ?, ?)", (title, memory_text, timestamp))
        conn.commit()
        was_added = cursor.rowcount > 0
    except sqlite3.IntegrityError:
        was_added = False
    finally:
        conn.close()
    return was_added
        
def add_memory_general(memory_text, table="general_memories"):
    """Adds a new, unique memory to the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    was_added = False
    try:
        cursor.execute(f"INSERT OR IGNORE INTO {table} (memory, timestamp) VALUES (?, ?)", (memory_text, timestamp))
        conn.commit()
        was_added = cursor.rowcount > 0
    except sqlite3.IntegrityError:
        was_added = False
    finally:
        conn.close()
    return was_added

def clear_memories(table="core_memories"):
    """Clears all memories from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table}")
    conn.commit()
    conn.close()

def clear_all_memories():
    """Clears all memories from all tables."""
    clear_memories("core_memories")
    clear_memories("general_memories")
    clear_memories("special_memories")
    
def delete_memory(memory_text, table="core_memories"):
    """Deletes a specific memory from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table} WHERE memory = ?", (memory_text,))
    conn.commit()
    conn.close()
    
def delete_special_memory(memory_text, table="special_memories"):
    """Deletes a specific memory from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table} WHERE memory = ?", (memory_text,))
    conn.commit()
    conn.close()

def delete_general_memory(memory_text, table="general_memories"):
    """Deletes a specific memory from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table} WHERE memory = ?", (memory_text,))
    conn.commit()
    conn.close()
