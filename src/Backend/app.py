from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
CORS(app)

# --- DB 및 JWT Secret Key 설정 추가 ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-very-secret-key-for-jwt' # 실제 프로젝트에서는 더 복잡한 키를 사용하세요.
db = SQLAlchemy(app)

# --- 신규 DB 모델 정의 ---
class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    professor = db.Column(db.String(50))
    category = db.Column(db.String(50))
    grade = db.Column(db.Integer)

class UserTakenCourse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('taken_courses', lazy=True))
    course = db.relationship('Course', backref=db.backref('takers', lazy=True))

# --- User 모델(테이블) 정의 (변경 없음) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# --- JWT 토큰 검증을 위한 데코레이터 (변경 없음) ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': '토큰이 존재하지 않습니다.'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except Exception as e:
            return jsonify({'message': '토큰이 유효하지 않습니다.', 'error': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# --- 기존 강의 정보 코드 (제거 또는 주석 처리) ---
# industrial_engineering_courses = [ ... ]

# --- 신규 API 엔드포인트 ---
@app.route('/api/courses/all', methods=['GET'])
def get_all_courses():
    courses = Course.query.all()
    return jsonify([{"id": c.id, "name": c.name, "professor": c.professor, "category": c.category} for c in courses])

@app.route('/api/user/courses', methods=['GET'])
@token_required
def get_user_courses(current_user):
    taken_courses = UserTakenCourse.query.filter_by(user_id=current_user.id).all()
    return jsonify([{"id": tc.course.id, "name": tc.course.name, "category": tc.course.category} for tc in taken_courses])

@app.route('/api/user/courses', methods=['POST'])
@token_required
def add_user_course(current_user):
    data = request.get_json()
    course_id = data.get('course_id')
    if not course_id:
        return jsonify({"error": "Course ID is required"}), 400
    
    # 이미 추가된 과목인지 확인
    if UserTakenCourse.query.filter_by(user_id=current_user.id, course_id=course_id).first():
        return jsonify({"error": "이미 이수한 과목입니다."}), 409

    new_taken_course = UserTakenCourse(user_id=current_user.id, course_id=course_id)
    db.session.add(new_taken_course)
    db.session.commit()
    return jsonify({"message": "이수 과목이 추가되었습니다."}), 201

@app.route('/api/user/courses/<int:course_id>', methods=['DELETE'])
@token_required
def delete_user_course(current_user, course_id):
    taken_course = UserTakenCourse.query.filter_by(user_id=current_user.id, course_id=course_id).first()
    if taken_course:
        db.session.delete(taken_course)
        db.session.commit()
        return jsonify({"message": "이수 과목이 삭제되었습니다."}), 200
    return jsonify({"error": "해당 이수 내역을 찾을 수 없습니다."}), 404

# --- 추천 강의 API (변경 없음) ---
@app.route('/api/recommendations', methods=['GET'])
@token_required
def get_recommendations(current_user):
    # 현재는 빈 목록을 반환합니다.
    # 추후에는 current_user.id를 기반으로 개인화된 추천 로직을 구현합니다.
    print(f"사용자 {current_user.email}를 위한 추천 목록을 생성합니다. (현재는 빈 목록)")
    recommendations = [] # 빈 목록 반환
    return jsonify(recommendations)

# --- 회원가입 API 추가 ---
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "이메일과 비밀번호는 필수입니다."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "이미 존재하는 이메일입니다."}), 409

    new_user = User(email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "회원가입이 성공적으로 완료되었습니다."}), 201

# --- 로그인 API 수정 (JWT 토큰 발급) ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password):
        return jsonify({"error": "이메일 또는 비밀번호가 올바르지 않습니다."}), 401

    # JWT 토큰 생성
    token = jwt.encode({
        'id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=1) # 1시간 유효
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({"message": "로그인이 성공적으로 완료되었습니다.", "token": token}), 200

# --- 사용자 정보 API 추가 (토큰 필요) ---
@app.route('/api/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        "id": current_user.id,
        "email": current_user.email
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Course 테이블에 데이터가 없으면 초기 데이터 추가
        if Course.query.count() == 0:
            initial_courses = [
                {"id": 1, "name": "공학수학", "professor": "이수진", "category": "전공기초", "grade": 1},
                {"id": 2, "name": "생산관리", "professor": "박현우", "category": "전공필수", "grade": 2},
                {"id": 3, "name": "데이터 분석 및 시각화", "professor": "김민준", "category": "전공선택", "grade": 3},
                {"id": 4, "name": "통계학개론", "professor": "최영희", "category": "전공기초", "grade": 1},
                {"id": 5, "name": "Python 프로그래밍", "professor": "강민호", "category": "교양", "grade": 1}
            ]
            for c_data in initial_courses:
                course = Course(**c_data)
                db.session.add(course)
            db.session.commit()
            print("초기 강의 데이터가 Course 테이블에 추가되었습니다.")
        
        # admin 계정 생성 로직 (변경 없음)
        if not User.query.filter_by(email='admin').first():
            admin_user = User(email='admin')
            admin_user.set_password('admin')
            db.session.add(admin_user)
            db.session.commit()
            print("디버깅용 admin 계정이 생성되었습니다.")
            
    app.run(debug=True, port=5001)