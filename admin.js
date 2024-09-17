document.getElementById('addQuestionForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const word = document.getElementById('word').value;
    const question = document.getElementById('question').value;

    fetch('https://genelkulturoyunu.onrender.com/add-question', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, word, question })
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
    document.getElementById('word').value='';
    document.getElementById('question').value='';
});



