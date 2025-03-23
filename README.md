<h3 align="center">QuoteMark</h3>

  <p align="center">
    QuoteMark is a web application that transforms physical book annotations into an organized digital library. Readers can capture their highlights and notes from printed books through manual entry or by using our smart scanning feature that automatically detects highlighted text. All annotations are stored in a searchable database where users can easily filter, tag, and review their collected insights by book, topic, or custom categories. QuoteMark ensures the valuable thoughts and passages marked in your physical books are never lost and always accessible—turning scattered marginalia into a personal knowledge repository you can reference anytime.
    <br />
    <a href="https://margin-minder-vlue.onrender.com/">Link to QuoteMark</a>
  </p>
</div>


<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



## About The Project

QuoteMark is a digital solution for readers who want to preserve and organize the valuable insights they highlight when reading.

Key features include:

* A personal digital library to organize all your books
* Text extraction from scanned book pages with automatic highlight detection
* Manual entry option for adding annotations and quotes
* Search functionality to find specific insights across your entire collection
* Custom tagging and categorization for better organization

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React][React.js]][React-url]
* [![Django][Django.com]][Django-url]
* [![PostgreSQL][PostgreSQL.com]][PostgreSQL-url]
* [![OpenCV][OpenCV.org]][OpenCV-url]
* [![Pytesseract][Tesseract.org]][Tesseract-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g
  ```
* Python 
* PostgreSQL
* Tesseract OCR

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/tings17/margin-minder.git
   ```
2. Install backend dependencies
   ```sh
   cd quotemark/backend
   pip install -r requirements.txt
   ```
3. Install frontend dependencies
   ```sh
   cd ../frontend
   npm install
   ```
4. Configure your database settings in settings.py
5. Start the backend server
    ```sh
    python manage.py runserver
    ```
6. Start the frontend server
    ```sh
    cd ../frontend
    npm run dev   
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### Adding a Book
1. Navigate to your library page (home page after loggin in)
2. Click "Add Book"
3. Enter book details (title and author)

### Creating Annotations
1. Click on a book from the library page
2. Choose either:
    * "Add Manual Annotation" to type out a quote
    * "Add Annotation with Image" to upload an image of the page with highlighted texts
3. For scanned pages, the app will automatically detect highlighted areas and extract the text

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [X] Book library
- [X] Manual annotation entry
- [X] OCR scanning with highlight detection
- [X] Basic search functionality
- [ ] Random "Annotation of the Day" generator
- [ ] Export functionality (PDF, Markdown)
- [ ] Discussion/journaling prompt generator

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

tingsun0517@gmail.com

Project Link: [https://github.com/tings17/margin-minder](https://github.com/tings17/margin-minder)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Django-url]: https://www.djangoproject.com/
[PostgreSQL-url]: https://www.postgresql.org/
[OpenCV-url]: https://opencv.org/
[Tesseract-url]: https://pypi.org/project/pytesseract/
