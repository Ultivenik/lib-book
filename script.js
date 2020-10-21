// variables de référence du DOM
let divMyBooks = document.querySelector('#myBooks')
let mainTitle = document.querySelector('.title')
let newBookTitle = document.querySelector('.h2')
let line = document.querySelector('hr')
let divContent = document.querySelector('#content')
let myBookListTitle = document.querySelector('#content h2')
let itemBookmarked = document.createElement('div')
itemBookmarked.classList.add('resultContainer')

//tableau des resultat de recherche
let searchResults = []
//tableau des resultats de recherche
//dans la sessionStorage
let savedResults = []

//logo
function logo() {
    let container = document.createElement('span')
    let logo = document.createElement('img')
    container.classList.add('logoContainer')
    logo.classList.add('logo')
    logo.src = './logo.png'
    logo.alt = 'logo poch\'list'
    container.appendChild(logo)
    divMyBooks.prepend(container)

    return container
}
//fonction d'insersion d'un element du DOM après un autre
function insertAfter(target, insertedElement){
    const parent = target.parentNode
    parent.insertBefore(insertedElement, target.nextSibling)
}
//Fonction de création de bouton
function createButtonAfterElement(target, text, id) {
    let button = document.createElement('button')
    insertAfter(target, button)
    button.id = id
    button.innerHTML = text

    return button
}
//fonction de création d'icone
function createIcon(color, nameClass, trigger, bool) {
    let icon = document.createElement('i')
    icon.style.color = color
    icon.classList.add('fas', `${nameClass}`)
    icon.addEventListener('click', trigger, {once:bool})

    return icon
}
//fonction de supression des noeud DOM en surplus
//en cas de spam sur les boutons
function deleteNode(node) {
    let target = document.querySelector(node)
    if (target !== null) {
        target.remove()
    }
}
// Affichage du formulaire de recherche
function displayForm() {
    let form = document.createElement('form')
    let title = document.createElement('label')
    let inputTitle = document.createElement('input')
    let author = document.createElement('label')
    let inputAuthor = document.createElement('input')
    form.id = "formTitle"
    form.setAttribute("action", "")

    title.innerText = "Titre"
    title.setAttribute("for", "bookTitle")

    inputTitle.id = "bookTitle"
    inputTitle.setAttribute("value", "")

    author.innerText = "Auteur"
    author.setAttribute("for", "bookAuthor")

    inputAuthor.id = "bookAuthor"
    inputAuthor.setAttribute("value", "")

    insertAfter(newBookTitle, form)
    form.appendChild(title)
    form.appendChild(inputTitle)
    form.appendChild(author)
    form.appendChild(inputAuthor)

    let searchButton = createButtonAfterElement(inputAuthor, 'Rechercher', 'searchBook')
    searchButton.setAttribute('type', 'submit')
    searchButton.setAttribute('disabled', '')

    let cancelButton = createButtonAfterElement(searchButton, 'Annuler', 'cancelButton')
    cancelButton.setAttribute('type', 'reset')

    inputTitle.addEventListener('input', () => {
        deleteNode('.error')
        searchButton.removeAttribute('disabled')
    })
    inputAuthor.addEventListener('input', () => {
        deleteNode('.error')
        searchButton.removeAttribute('disabled')
    })
    searchButton.addEventListener('click', handleSearch)
    cancelButton.addEventListener('click', handleCancel)
}
//fonction du bouton 'ajouter un livre'
function handleAddBook(e) {
    e.preventDefault()
    e.target.style.display = 'none'
    displayForm()
}
// bouton Annuler
function handleCancel() {
    deleteNode('#formTitle')
    deleteNode('.resultTitle')
    deleteNode('.error')
    deleteNode('.resultContainer')
    deleteNode('.bookSummary')
    let addBookButton = document.querySelector('#addBook')
    addBookButton.style.display = "block"
    initBookmark()
}
//affichage des résultats
function displayResult() {
    deleteNode('.resultContainer')
    deleteNode('.resultTitle')
    deleteNode('.bookSummary')

    let parent = document.createElement('div')
    let title = document.createElement('h2')

    parent.classList.add('resultContainer')
    title.innerHTML = "Résultat de la recherche"
    title.classList.add('resultTitle')

    searchResults.forEach(book => {
        let bookDiv = createBookSummary(
            book.volumeInfo.title,
            book.id,
            book.volumeInfo.authors[0],
            book.volumeInfo.description,
            book.volumeInfo.imageLinks.thumbnail,
            createIcon('blue', 'fa-bookmark', saveBookmark, true),
        )
        parent.appendChild(bookDiv)
    })
    insertAfter(line, title)
    insertAfter(title, parent)
    initBookmark()
}
//fonction de recherche des livres
async function handleSearch(e) {
    e.preventDefault()
    searchResults = []

    let bookTitle = document.querySelector('#bookTitle').value
    let bookAuthor = document.querySelector('#bookAuthor').value
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${bookTitle.trim()}+inauthor:${bookAuthor.trim()}`
    if (bookTitle === '' || bookAuthor === '') {
        deleteNode('.error')
        error('error', "vous devez remplir le champ")
        return
    }
    await fetch(url)
    .then(response =>{
        return response.json()
    })
    .then(data =>{
        const books = data.items
        if (searchResults <= books.length) {
            books.forEach(book => {
                searchResults.push(book)
            })
        }
    })
    .catch((err) =>{
        deleteNode('.error')
        err = "Votre recherche n'a pu aboutir. Veuillez réessayer"
        error('error', err)
    })
    displayResult()
}
function error(NameClass, err) {
    deleteNode(NameClass)
    let error = document.createElement('p')
    error.classList.add(`${NameClass}`)
    error.innerHTML = err
    divMyBooks.insertBefore(error, line)
}
//Noeud DOM pour un livre
function createBookSummary (title, id, author, description, image, icon) {
    // node
    let summaryContainer = document.createElement('div')
    summaryContainer.id = id
    summaryContainer.classList.add('bookSummary')
    //titre
     let bookTitle = document.createElement('h3')
    bookTitle.innerText = `${title}`
    summaryContainer.appendChild(bookTitle)
    //Id
    let bookId = document.createElement('p')
    let spanId = document.createElement('span')
    spanId.innerText = 'ID: '
    bookId.innerText = id
    bookId.prepend(spanId)
    bookId.classList.add('first-para')
    summaryContainer.appendChild(bookId)
    //Auteur
    let bookAuthor = document.createElement('p')
    let spanAuthor = document.createElement('span')
    spanAuthor.innerText = 'Auteur: '
    bookAuthor.innerText = author
    bookAuthor.prepend(spanAuthor)
    summaryContainer.appendChild(bookAuthor)
    //Description
    let bookDescription = document.createElement('p')
    if (description === undefined) {
        bookDescription.innerText = "Informations manquantes"
    }else {
        bookDescription.innerText = `${description.substring(0, 200)}...`
    }
    let spanD = document.createElement('span')
    spanD.innerText = 'Description: '
    bookDescription.prepend(spanD)
    summaryContainer.appendChild(bookDescription)
    //image
    let bookThumbnail = document.createElement('img')
    bookThumbnail.classList.add('img-book')
    if (image === undefined) {
        bookThumbnail.src = './unavailable.png'
    }else {
        bookThumbnail.src = image
    }
    summaryContainer.appendChild(bookThumbnail)
    //icone
    summaryContainer.prepend(icon)

    return summaryContainer
}
// fonction sauvegarde dans la poch'liste
function saveBookmark(e){
    let target = e.target
    let parent = target.parentNode.children
    target.style.color = 'green'
    //récupération des données
    const dataBook = {
        title: parent[1].innerText,
        id: parent[2].parentElement.id,
        author: parent[3].lastChild.nodeValue,
        description: parent[4].lastChild.nodeValue,
        img: parent[5].src
    }
    target.addEventListener('click', () => {
        if (target.style.color ==='green') {
            errorSpan(target, "Vous ne pouvez pas ajouter deux fois le même livre.")
        }
    })
    // nouvelle div dans poch list avec les données
    let bookMarked = createBookSummary(
        dataBook.title,
        dataBook.id,
        dataBook.author,
        dataBook.description,
        dataBook.img,
        createIcon('red', 'fa-trash', deleteBookmark, false)
    )
    //ajout dans le sessionStorage
    savedResults.push(dataBook)
    //empecher les doublons dans la pochliste
    const hashMap = {}
    savedResults = savedResults.filter((item) =>{
        let alreadyExist = hashMap.hasOwnProperty(item.id)
        return alreadyExist ? false : hashMap[item.id] = 1
    })
    sessionStorage.setItem("bookmark", JSON.stringify(savedResults))

    itemBookmarked.appendChild(bookMarked)
    divContent.appendChild(itemBookmarked)
}
//message d'erreur en cas de doublons
function errorSpan (target, message) {
    deleteNode('.errorMessage')
    let span = document.createElement('span')
    span.classList.add('errorMessage')
    span.innerText = message
    insertAfter(target, span)
    setTimeout(() => {
        deleteNode('.errorMessage')
    }, 1500)
    return span
}
//Fonction d'effecement de l'item dans la pochliste
function deleteBookmark(e, index) {
    //delete node
    let parent = e.target.parentNode
    parent.remove()
    //delete item in sessionStorage
    let storage = JSON.parse(sessionStorage.getItem('bookmark'))
    storage.splice(index, 1)
    sessionStorage.setItem("bookmark", JSON.stringify(storage))
}
//initialisation des poch'listes sauvegardées
//au rafraîchissement de la page
function initBookmark() {
    let summary = JSON.parse(sessionStorage.getItem('bookmark'))
    if (summary !== null) {
        summary.map(book => {
            let bookmarked = createBookSummary(
                book.title,
                book.id,
                book.author,
                book.description,
                book.img,
                createIcon('red', 'fa-trash', deleteBookmark, false)
                )
                savedResults.push(book)
                //fonction anti doublon
                const hashMap = {}
                savedResults = savedResults.filter((item) =>{
                    let alreadyExist = hashMap.hasOwnProperty(item.id)
                    return alreadyExist ? false : hashMap[item.id] = 1
                })
            itemBookmarked.appendChild(bookmarked)
            divContent.appendChild(itemBookmarked)
            sessionStorage.setItem('bookmark', JSON.stringify(savedResults))
        })
    }
}
//initialisation de la page
function init () {
    logo()
    const addBookButton = createButtonAfterElement(newBookTitle, 'Ajouter un livre', 'addBook')
    addBookButton.addEventListener('click', handleAddBook)
    initBookmark()
}
//événement d'initialisation de la page web
document.addEventListener('DOMContentLoaded', init)
