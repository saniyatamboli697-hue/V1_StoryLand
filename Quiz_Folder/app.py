from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn_str = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=tcp:resumevalidetor.database.windows.net,1433;"
        "DATABASE=resumevalidator1;"
        "UID=adminuser;"
        "PWD=Admin@123456789;"
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )
    return pyodbc.connect(conn_str)

@app.route('/api/quiz-result', methods=['POST'])
def save_quiz_result():
    try:
        data = request.json
        print(f"📥 Saving: {data['email']} - {data['quizName']} ({data['score']}/{data['total']})")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # ✅ YOUR EXACT COLUMNS + AttemptDate with CURRENT TIMESTAMP
        cursor.execute("""
            INSERT INTO QuizResults (
                Email, Username, QuizId, QuizName, Score, 
                TotalQuestions, TimeTaken, Answers, AttemptDate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['email'],
            data.get('username'), 
            data['quizId'],
            data['quizName'],
            data['score'],
            data['total'],
            data['timeTaken'],
            json.dumps(data['answers']),
            datetime.now()  # ✅ FIX: Current timestamp
        ))
        
        conn.commit()
        cursor.execute("SELECT @@IDENTITY")
        new_id = cursor.fetchone()[0]
        conn.close()
        
        print(f"✅ SAVED! Record ID: {new_id}")
        return jsonify({
            'success': True,
            'message': f'✅ Saved to Azure SQL! Record ID: {int(new_id)}',
            'recordId': int(new_id)
        })
        
    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/quiz-results/<email>', methods=['GET'])
def get_results(email):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT Id, QuizId, QuizName, Score, TotalQuestions, 
                   TimeTaken, AttemptDate
            FROM QuizResults WHERE Email = ? ORDER BY Id DESC
        """, (email,))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'id': row[0],
                'quizId': row[1],
                'quizName': row[2],
                'score': row[3],
                'total': row[4],
                'timeTaken': row[5],
                'date': str(row[6])
            })
        conn.close()
        return jsonify({'success': True, 'results': results})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)