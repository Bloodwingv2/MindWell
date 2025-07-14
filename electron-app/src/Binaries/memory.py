import sqlite3
import json
import os
from datetime import datetime

MEMORY_DB = "memory.db"

def init_db():
    """Initializes the database with core and general memories tables."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    
    # Create core memories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS core_memories (
            id INTEGER PRIMARY KEY,
            memory TEXT NOT NULL UNIQUE,
            timestamp TEXT NOT NULL
        )
    ''')

    # Create general memories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS general_memories (
            id INTEGER PRIMARY KEY,
            memory TEXT NOT NULL UNIQUE,
            timestamp TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()

# Call init_db() on module load
init_db()

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


def add_memory_core(memory_text, table="core_memories"):
    """Adds a new, unique memory to the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()

    try:
        cursor.execute(f"INSERT OR IGNORE INTO {table} (memory, timestamp) VALUES (?, ?)", (memory_text, timestamp))
        conn.commit()
        was_added = cursor.rowcount > 0
    except sqlite3.IntegrityError:
        was_added = False
    finally:
        conn.close()
        

def add_memory_general(memory_text, table="general_memories"):
    """Adds a new, unique memory to the specified table."""
    conn = sqlite3.connect(MEMORY_DB)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()

    try:
        cursor.execute(f"INSERT OR IGNORE INTO {table} (memory, timestamp) VALUES (?, ?)", (memory_text, timestamp))
        conn.commit()
        was_added = cursor.rowcount > 0
    except sqlite3.IntegrityError:
        was_added = False
    finally:
        conn.close()

    return was_added