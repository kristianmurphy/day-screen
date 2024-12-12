# App.py

from flask import Flask, render_template
import git

app = Flask(__name__)

@app.route('/update_server', methods=['POST'])
    def webhook():
        if request.method == 'POST':
            repo = git.Repo('path/to/git_repo')
            origin = repo.remotes.origin
origin.pull()
return 'Updated PythonAnywhere successfully', 200
        else:
            return 'Wrong event type', 400
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
