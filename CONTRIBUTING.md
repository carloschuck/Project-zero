# Contributing to Ticketing System

Thank you for considering contributing to this project! We welcome contributions from the community.

## 📋 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and encourage diverse perspectives
- Focus on constructive feedback
- Respect differing opinions and experiences

## 🚀 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, versions)

### Suggesting Enhancements

We love new ideas! Please create an issue with:
- Clear description of the enhancement
- Use case and benefits
- Possible implementation approach
- Any relevant examples

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/Project-zero.git
   cd Project-zero
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test Your Changes**
   - Ensure the app runs without errors
   - Test all affected features
   - Check responsive design

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```
   
   **Commit Message Guidelines:**
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issues if applicable (#123)

6. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Provide clear description of changes
   - Reference related issues
   - Include screenshots for UI changes
   - Be prepared to address feedback

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Local Development
```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Setup environment files
cp backend/.env.example backend/.env
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env

# Start database
docker-compose up -d postgres

# Run migrations
cd backend && npm run migrate && cd ..

# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm run dev
```

## 📝 Coding Standards

### JavaScript/React
- Use ES6+ syntax
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable names

### CSS/TailwindCSS
- Use Tailwind utility classes
- Keep custom CSS minimal
- Follow mobile-first approach
- Ensure dark mode compatibility

### Backend
- Use async/await for async operations
- Implement proper error handling
- Validate all user inputs
- Follow RESTful API conventions
- Add comments for complex logic

## 🧪 Testing

Before submitting a PR:
- Test all functionality manually
- Ensure no console errors
- Test on different screen sizes
- Test both light and dark modes
- Verify database operations work correctly

## 📚 Documentation

When adding features:
- Update README.md if needed
- Add comments to complex code
- Update API documentation
- Include usage examples

## 🐛 Found a Security Issue?

Please **DO NOT** create a public issue. Instead:
- Email security concerns to the maintainers
- Include detailed information
- Allow time for a fix before public disclosure

## ❓ Questions?

- Check existing issues and discussions
- Review the README.md
- Create an issue with the "question" label

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**

