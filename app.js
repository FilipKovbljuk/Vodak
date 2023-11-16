from flask import Flask, render_template, request

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')

@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('prvni_stranka.html'), 200


@app.route('/druha_stranka', methods=['GET', 'POST'])
def druha_stranka():
    return render_template('druha_stranka.html', zprava="Tajná zpráva.."), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
"""

from crypt import methods
import re
from flask import Flask, flash, jsonify, render_template, request

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')

registrations = []
students = []
pattern = "^[a-zA-Z0-9_-]{2,20}$"


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', registrations=registrations, students=students)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    return render_template('signup.html', students=students)


@app.route('/admin', methods=['GET'])
def admin():
    return render_template('admin.html', registrations=registrations, students=students)


@app.route('/reg', methods=['POST'])
def reg():
    name = request.form['name']
    nickname = request.form['nickname']
    surname = request.form['surname']
    canSwim = request.form['canSwim']

    # Kontrola dat z formuláře
    if not name:
        return jsonify({'status': 'error', 'message': 'Zadej své jméno'}), 400

    # nick musí obsahovat pouze znaky anglické abecedy, číslice a velikost mezi 2 až 20 znaků
    elif not re.match(pattern, name):
        return jsonify({'status': 'error',
                        'message': 'Jméno musí obsahovat pouze znaky anglické abecedy, číslice a velikost mezi 2 až 20 znaků'}), 400

    elif not nickname:
        return jsonify({'status': 'error', 'message': 'Zadej svůj nick'}), 400

    elif not re.match(pattern, nickname):
        return jsonify({'status': 'error',
                        'message': 'Nick musí obsahovat pouze znaky anglické abecedy, číslice a velikost mezi 2 až 20 znaků'}), 400

    elif not surname:
        return jsonify({'status': 'error', 'message': 'Zadej své příjmení'}), 400

    elif not re.match(pattern, surname):
        return jsonify({'status': 'error',
                        'message': 'Příjmení musí obsahovat pouze znaky anglické abecedy, číslice a velikost mezi 2 až 20 znaků'}), 400

    elif canSwim == '0':
        return jsonify({'status': 'error', 'message': 'Musíš být plavec, abys mohl jet na vodácký kurz'}), 400

    for student in students:
        if student['nickname'] == nickname:
            return jsonify({'status': 'error', 'message': 'Tento student je již registrován'}), 400

    else:
        students.append({
            'id': len(students),
            'name': name,
            'nickname': nickname,
            'surname': surname})
        return jsonify({'status': 'success', 'message': 'Registrace byla úspéšně odeslána'}), 201


@app.route('/seats', methods=['POST'])
def seats():
    student1_nickname = request.form['student1']
    student2_nickname = request.form['student2']

    if not student1_nickname:
        return jsonify({'status': 'error', 'message': 'Vyber prvního studenta'}), 400

    elif not student2_nickname:
        return jsonify({'status': 'error', 'message': 'Vyber druhého studenta'}), 400

    elif student1_nickname == student2_nickname:
        return jsonify({'status': 'error', 'message': 'Vyber dva různé studenty'}), 400

    for registration in registrations:
        if registration['student1_nickname'] == student1_nickname and registration[
            'student2_nickname'] == student2_nickname:
            return jsonify({'status': 'error', 'message': 'Tito studenti jsou již spolu na kurzu'}), 400

    for registration in registrations:
        if registration['student1_nickname'] == student1_nickname or registration[
            'student2_nickname'] == student1_nickname:
            return jsonify({'status': 'error', 'message': 'Tento student je již na kurzu'}), 400

        elif registration['student1_nickname'] == student2_nickname or registration[
            'student2_nickname'] == student2_nickname:
            return jsonify({'status': 'error', 'message': 'Tento student je již na kurzu'}), 400

    else:
        registrations.append({
            'id': len(registrations),
            'student1_nickname': student1_nickname,
            'student1_name': [student['name'] for student in students if student['nickname'] == student1_nickname][0],
            'student1_surname':
                [student['surname'] for student in students if student['nickname'] == student1_nickname][0],
            'student2_nickname': student2_nickname,
            'student2_name': [student['name'] for student in students if student['nickname'] == student2_nickname][0],
            'student2_surname':
                [student['surname'] for student in students if student['nickname'] == student2_nickname][0]
        })
        return jsonify({'status': 'success', 'message': 'Registrace na vodácký kurz byla úspéšně odeslána'}), 201


@app.route('/admin/delete/student', methods=['POST'])
def admin_delete_student():
    nickname = request.form['nickname']

    if not nickname:
        return jsonify({'status': 'error', 'message': 'Nastala chyba'}), 400

    for student in students:
        if student['nickname'] == nickname:
            students.remove(student)
            return jsonify({'status': 'success', 'message': 'Student byl úspěšně smazán'}), 201

    else:
        return jsonify({'status': 'error', 'message': 'Student nebyl nalezen'}), 400


@app.route('/admin/delete/seating', methods=['POST'])
def admin_delete_seating():
    student1_nickname = request.form['student1_nickname']
    student2_nickname = request.form['student2_nickname']

    if not student1_nickname:
        return jsonify({'status': 'error', 'message': 'Nastala chyba'}), 400

    elif not student2_nickname:
        return jsonify({'status': 'error', 'message': 'Nastala chyba'}), 400

    for registration in registrations:
        if registration['student1_nickname'] == student1_nickname and registration[
            'student2_nickname'] == student2_nickname:
            registrations.remove(registration)
            return jsonify({'status': 'success', 'message': 'Registrace byla úspěšně smazána'}), 201

    else:
        return jsonify({'status': 'error', 'message': 'Registrace nebyla nalezena'}), 400


@app.route('/admin/mock', methods=['POST'])
def admin_mock():
    registrations.clear()
    students.clear()

    students.append({'id': 0, 'name': 'Jan', 'nickname': 'Janek', 'surname': 'Novák'})
    students.append({'id': 1, 'name': 'Petr', 'nickname': 'Petr', 'surname': 'Novák'})
    students.append({'id': 2, 'name': 'Karel', 'nickname': 'Karel', 'surname': 'Novák'})
    students.append({'id': 3, 'name': 'Jana', 'nickname': 'Jana', 'surname': 'Nováková'})

    registrations.append({
        'id': 0,
        'student1_nickname': 'Janek',
        'student1_name': 'Jan',
        'student1_surname': 'Novák',
        'student2_nickname': 'Petr',
        'student2_name': 'Petr',
        'student2_surname': 'Novák'
    })

    registrations.append({
        'id': 1,
        'student1_nickname': 'Karel',
        'student1_name': 'Karel',
        'student1_surname': 'Novák',
        'student2_nickname': 'Jana',
        'student2_name': 'Jana',
        'student2_surname': 'Nováková'
    })

    return jsonify({'status': 'success', 'message': 'Data byla úspěšně načtena'}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
