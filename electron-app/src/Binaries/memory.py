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

# Alternative version with message separation
def add_to_buffer(sender: str, message: str):
    """Consolidates all messages into a single entry per sender with a message counter."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    
    try:
        # Delete all older unread entries for this sender
        cursor.execute(
            "DELETE FROM conversation_buffer WHERE sender = ? AND status = 'unread'",
            (sender,)
        )
        
        # Add new entry
        cursor.execute(
            """INSERT INTO conversation_buffer 
               (timestamp, sender, message, status) 
               VALUES (?, ?, ?, 'unread')""",
            (timestamp, sender, message)
        )
        conn.commit()
    finally:
        conn.close()

def get_unread_buffer():
    """Fetches all unread messages grouped by sender."""
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Group all messages by sender
    cursor.execute("""
        SELECT 
            MIN(id) as id,
            sender,
            GROUP_CONCAT(message, '\n---\n') as message
        FROM conversation_buffer 
        WHERE status = 'unread'
        GROUP BY sender
        ORDER BY MIN(timestamp) ASC
    """)
    
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return messages

def delete_processed_buffer(ids):
    """Marks all messages as processed."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    try:
        # Mark all as processed instead of deleting
        cursor.execute("UPDATE conversation_buffer SET status = 'processed'")
        conn.commit()
    finally:
        conn.close()


def load_memories_special(table="special_memories"):
    """Loads all memories from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(f"SELECT id, title, memory, timestamp FROM {table} ORDER BY timestamp DESC")
    memories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return memories

def get_relevant_special_memories(query, table="special_memories", k=20):
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


def add_special_memory(memory_text, title, table="special_memories"):
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
        

def clear_memories(table):
    """Clears all memories from the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table}")
    conn.commit()
    conn.close()
    
    
def delete_special_memory(memory_id: int, table="special_memories"):
    """Deletes a specific memory from the specified table by its ID."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    cursor.execute(f"DELETE FROM {table} WHERE id = ?", (memory_id,))
    conn.commit()
    conn.close()


def update_special_memory(memory_id: int, new_title: str, new_memory_text: str):
    """Updates a specific special memory."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE special_memories SET title = ?, memory = ? WHERE id = ?", (new_title, new_memory_text, memory_id))
        conn.commit()
    finally:
        conn.close()
        

def clear_all_memories():
    """Clears all memories from all tables."""
    clear_memories("special_memories")