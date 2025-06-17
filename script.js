// Global Variables
let currentStep = 1;
const totalSteps = 3;
let moodData = JSON.parse(localStorage.getItem('moodData')) || [];
let goalsData = JSON.parse(localStorage.getItem('goalsData')) || [];
let journalEntries = JSON.parse(localStorage.getItem('journalEntries')) || [];
let selectedMood = null;
let selectedFactors = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupHeroAnimations();
    setupMoodTracker();
    setupGoals();
    setupJournal();
    setupResources();
    setupContactForm();
    updateAnalytics();
    displayGoals();
    displayJournalEntries();
    loadResources();
    setCurrentDate();
}

// Navigation Functions
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Close mobile menu
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const sectionTop = section.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navHeight = document.querySelector('.navbar').offsetHeight;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Hero Section Animations
function setupHeroAnimations() {
    animateCounters();
    animateHeroElements();
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.7
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const duration = 2000; // 2 seconds
    const stepTime = duration / 100;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            setTimeout(updateCounter, stepTime);
        } else {
            element.textContent = target.toLocaleString();
        }
    };
    
    updateCounter();
}

function animateHeroElements() {
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroContent && heroVisual) {
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
        
        setTimeout(() => {
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateY(0)';
        }, 400);
    }
}

// Mood Tracker Functions
function setupMoodTracker() {
    const moodOptions = document.querySelectorAll('.mood-option');
    const factorItems = document.querySelectorAll('.factor-item');
    const saveMoodBtn = document.getElementById('saveMoodBtn');
    const timeButtons = document.querySelectorAll('.time-btn');

    // Mood selection
    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedMood = {
                value: parseInt(option.dataset.mood),
                label: option.dataset.label
            };
        });
    });

    // Factor selection
    factorItems.forEach(item => {
        item.addEventListener('click', () => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            updateSelectedFactors();
        });
    });

    // Save mood
    saveMoodBtn?.addEventListener('click', saveMoodEntry);

    // Time period selection
    timeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            timeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const period = parseInt(btn.dataset.period);
            updateMoodChart(period);
        });
    });
}

function updateSelectedFactors() {
    const checkedFactors = document.querySelectorAll('.factor-item input[type="checkbox"]:checked');
    selectedFactors = Array.from(checkedFactors).map(factor => factor.value);
}

function saveMoodEntry() {
    if (!selectedMood) {
        showMessage('Please select your mood first', 'error');
        return;
    }

    const notes = document.getElementById('moodNotes').value;
    const today = new Date().toDateString();
    
    // Check if entry already exists for today
    const existingEntryIndex = moodData.findIndex(entry => entry.date === today);
    
    const moodEntry = {
        date: today,
        timestamp: new Date().toISOString(),
        mood: selectedMood,
        factors: [...selectedFactors],
        notes: notes
    };

    if (existingEntryIndex >= 0) {
        moodData[existingEntryIndex] = moodEntry;
        showMessage('Today\'s mood updated successfully!', 'success');
    } else {
        moodData.push(moodEntry);
        showMessage('Mood saved successfully!', 'success');
    }

    // Save to localStorage
    localStorage.setItem('moodData', JSON.stringify(moodData));
    
    // Reset form
    resetMoodForm();
    
    // Update analytics
    updateAnalytics();
}

function resetMoodForm() {
    document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.factor-item input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('moodNotes').value = '';
    selectedMood = null;
    selectedFactors = [];
}

function updateAnalytics() {
    if (moodData.length === 0) return;

    // Calculate average mood
    const avgMood = (moodData.reduce((sum, entry) => sum + entry.mood.value, 0) / moodData.length).toFixed(1);
    document.getElementById('avgMood').textContent = `${avgMood}/5`;

    // Find best day
    const dayMoods = {};
    moodData.forEach(entry => {
        const day = new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
        if (!dayMoods[day]) dayMoods[day] = [];
        dayMoods[day].push(entry.mood.value);
    });

    let bestDay = '';
    let bestAvg = 0;
    for (const [day, moods] of Object.entries(dayMoods)) {
        const avg = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestDay = day;
        }
    }
    document.getElementById('bestDay').textContent = bestDay || 'N/A';

    // Calculate streak
    const streak = calculateMoodStreak();
    document.getElementById('trackingStreak').textContent = `${streak} days`;

    // Update mood chart
    updateMoodChart(7);
}

function calculateMoodStreak() {
    if (moodData.length === 0) return 0;

    const sortedData = [...moodData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < sortedData.length; i++) {
        const entryDate = new Date(sortedData[i].timestamp);
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function updateMoodChart(days) {
    // Simple chart representation - in a real app, you'd use Chart.js or similar
    const chartContainer = document.querySelector('.mood-chart-container');
    if (!chartContainer) return;

    const recentData = moodData
        .filter(entry => {
            const entryDate = new Date(entry.timestamp);
            const daysAgo = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo <= days;
        })
        .slice(-days);

    // Create simple bar chart
    let chartHTML = '<div class="simple-chart">';
    recentData.forEach((entry, index) => {
        const height = (entry.mood.value / 5) * 100;
        const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        chartHTML += `
            <div class="chart-bar">
                <div class="bar" style="height: ${height}%" title="${entry.mood.label} - ${date}"></div>
                <span class="bar-label">${date}</span>
            </div>
        `;
    });
    chartHTML += '</div>';

    chartContainer.innerHTML = chartHTML;
}

// Goals Functions
function setupGoals() {
    const addGoalBtn = document.getElementById('addGoalBtn');
    const filterButtons = document.querySelectorAll('.goals-filter .filter-btn');

    addGoalBtn?.addEventListener('click', addGoal);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterGoals(btn.dataset.filter);
        });
    });
}

function addGoal() {
    const title = document.getElementById('goalTitle').value.trim();
    const category = document.getElementById('goalCategory').value;
    const target = parseInt(document.getElementById('goalTarget').value);

    if (!title) {
        showMessage('Please enter a goal title', 'error');
        return;
    }

    const goal = {
        id: Date.now(),
        title,
        category,
        target,
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString()
    };

    goalsData.push(goal);
    localStorage.setItem('goalsData', JSON.stringify(goalsData));

    // Reset form
    document.getElementById('goalTitle').value = '';
    document.getElementById('goalTarget').value = '3';
    document.getElementById('goalCategory').selectedIndex = 0;

    displayGoals();
    showMessage('Goal added successfully!', 'success');
}

function displayGoals(filter = 'all') {
    const goalsGrid = document.getElementById('goalsGrid');
    if (!goalsGrid) return;

    let filteredGoals = goalsData;

    if (filter === 'active') {
        filteredGoals = goalsData.filter(goal => !goal.completed);
    } else if (filter === 'completed') {
        filteredGoals = goalsData.filter(goal => goal.completed);
    }

    if (filteredGoals.length === 0) {
        goalsGrid.innerHTML = '<p class="no-goals">No goals found. Add your first wellness goal!</p>';
        return;
    }

    goalsGrid.innerHTML = filteredGoals.map(goal => `
        <div class="goal-card" data-category="${goal.category}">
            <div class="goal-header">
                <h4 class="goal-title">${goal.title}</h4>
                <span class="goal-category">${goal.category}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-label">
                    <span>Progress</span>
                    <span>${goal.progress}/${goal.target} this week</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(goal.progress / goal.target) * 100}%"></div>
                </div>
            </div>
            <div class="goal-actions">
                <button class="action-btn complete" onclick="updateGoalProgress(${goal.id})" ${goal.completed ? 'disabled' : ''}>
                    ${goal.completed ? 'Completed' : 'Mark Done'}
                </button>
                <button class="action-btn delete" onclick="deleteGoal(${goal.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateGoalProgress(goalId) {
    const goal = goalsData.find(g => g.id === goalId);
    if (!goal || goal.completed) return;

    goal.progress = Math.min(goal.progress + 1, goal.target);
    
    if (goal.progress >= goal.target) {
        goal.completed = true;
        showMessage(`Congratulations! You completed "${goal.title}"!`, 'success');
    } else {
        showMessage('Great job! Progress updated.', 'success');
    }

    localStorage.setItem('goalsData', JSON.stringify(goalsData));
    displayGoals();
}

function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goalsData = goalsData.filter(g => g.id !== goalId);
        localStorage.setItem('goalsData', JSON.stringify(goalsData));
        displayGoals();
        showMessage('Goal deleted successfully', 'info');
    }
}

function filterGoals(filter) {
    displayGoals(filter);
}

// Journal Functions
function setupJournal() {
    const journalEntry = document.getElementById('journalEntry');
    const saveJournalBtn = document.getElementById('saveJournalBtn');
    const promptButtons = document.querySelectorAll('.prompt-btn');
    const searchInput = document.getElementById('journalSearch');

    // Word count
    journalEntry?.addEventListener('input', updateWordCount);

    // Save journal entry
    saveJournalBtn?.addEventListener('click', saveJournalEntry);

    // Prompt buttons
    promptButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            const currentText = journalEntry.value;
            const newText = currentText ? `${currentText}\n\n${prompt}\n` : `${prompt}\n`;
            journalEntry.value = newText;
            journalEntry.focus();
            updateWordCount();
        });
    });

    // Search functionality
    searchInput?.addEventListener('input', searchJournalEntries);
}

function updateWordCount() {
    const journalEntry = document.getElementById('journalEntry');
    const wordCount = document.getElementById('wordCount');
    
    if (journalEntry && wordCount) {
        const words = journalEntry.value.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = `${words.length} words`;
    }
}

function saveJournalEntry() {
    const journalEntry = document.getElementById('journalEntry');
    const text = journalEntry.value.trim();
    
    if (!text) {
        showMessage('Please write something before saving', 'error');
        return;
    }

    const today = new Date().toDateString();
    const existingEntryIndex = journalEntries.findIndex(entry => entry.date === today);

    const entry = {
        id: existingEntryIndex >= 0 ? journalEntries[existingEntryIndex].id : Date.now(),
        date: today,
        timestamp: new Date().toISOString(),
        content: text,
        wordCount: text.split(/\s+/).filter(word => word.length > 0).length
    };

    if (existingEntryIndex >= 0) {
        journalEntries[existingEntryIndex] = entry;
        showMessage('Journal entry updated!', 'success');
    } else {
        journalEntries.unshift(entry);
        showMessage('Journal entry saved!', 'success');
    }

    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    displayJournalEntries();
}

function displayJournalEntries(entries = journalEntries) {
    const entriesList = document.getElementById('entriesList');
    if (!entriesList) return;

    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="no-entries">No journal entries yet. Start writing!</p>';
        return;
    }

    entriesList.innerHTML = entries.map(entry => `
        <div class="entry-item" onclick="loadJournalEntry('${entry.id}')">
            <div class="entry-date-small">${new Date(entry.timestamp).toLocaleDateString()}</div>
            <div class="entry-preview">${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}</div>
        </div>
    `).join('');
}

function loadJournalEntry(entryId) {
    const entry = journalEntries.find(e => e.id == entryId);
    if (entry) {
        document.getElementById('journalEntry').value = entry.content;
        updateWordCount();
        showMessage('Entry loaded for editing', 'info');
    }
}

function searchJournalEntries() {
    const searchTerm = document.getElementById('journalSearch').value.toLowerCase();
    const filteredEntries = journalEntries.filter(entry => 
        entry.content.toLowerCase().includes(searchTerm) ||
        new Date(entry.timestamp).toLocaleDateString().includes(searchTerm)
    );
    displayJournalEntries(filteredEntries);
}

function setCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        currentDateElement.textContent = formattedDate;
    }
}

// Resources Functions
function setupResources() {
    const filterButtons = document.querySelectorAll('.resources-filter .filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterResources(btn.dataset.category);
        });
    });
}

function loadResources() {
    const resources = [
        {
            id: 1,
            title: "Mental Health America",
            description: "Comprehensive mental health resources, screening tools, and support information.",
            category: "articles",
            icon: "📚",
            link: "https://mhanational.org"
        },
        {
            id: 2,
            title: "Headspace: Meditation Made Simple",
            description: "Guided meditation and mindfulness exercises for better mental health.",
            category: "apps",
            icon: "🧘",
            link: "https://headspace.com"
        },
        {
            id: 3,
            title: "The Mental Health Podcast",
            description: "Expert discussions on mental health topics, coping strategies, and wellness tips.",
            category: "podcasts",
            icon: "🎧",
            link: "#"
        },
        {
            id: 4,
            title: "Anxiety and Depression Association",
            description: "Evidence-based information on anxiety and depression treatment options.",
            category: "articles",
            icon: "🏥",
            link: "https://adaa.org"
        },
        {
            id: 5,
            title: "Crisis Text Line",
            description: "Free, 24/7 crisis support via text message. Text HOME to 741741.",
            category: "hotlines",
            icon: "📱",
            link: "https://crisistextline.org"
        },
        {
            id: 6,
            title: "TED Talks: Mental Health",
            description: "Inspiring talks from experts and individuals sharing mental health insights.",
            category: "videos",
            icon: "📺",
            link: "https://ted.com"
        },
        {
            id: 7,
            title: "Calm: Sleep & Meditation",
            description: "Sleep stories, meditation sessions, and relaxation techniques.",
            category: "apps",
            icon: "😴",
            link: "https://calm.com"
        },
        {
            id: 8,
            title: "National Suicide Prevention Lifeline",
            description: "24/7 free and confidential support. Call 988 for immediate help.",
            category: "hotlines",
            icon: "☎️",
            link: "https://suicidepreventionlifeline.org"
        }
    ];

    displayResources(resources);
}

function displayResources(resources) {
    const resourcesGrid = document.getElementById('resourcesGrid');
    if (!resourcesGrid) return;

    resourcesGrid.innerHTML = resources.map(resource => `
        <div class="resource-card" data-category="${resource.category}">
            <div class="resource-header">
                <span class="resource-icon">${resource.icon}</span>
                <span class="resource-category">${resource.category}</span>
            </div>
            <h3 class="resource-title">${resource.title}</h3>
            <p class="resource-description">${resource.description}</p>
            <a href="${resource.link}" class="resource-link" target="_blank" rel="noopener noreferrer">
                Learn More →
            </a>
        </div>
    `).join('');
}

function filterResources(category) {
    const resourceCards = document.querySelectorAll('.resource-card');
    
    resourceCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Contact Form Functions
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');

    nextBtn?.addEventListener('click', nextStep);
    prevBtn?.addEventListener('click', prevStep);
    contactForm?.addEventListener('submit', handleFormSubmit);

    // Real-time validation
    const inputs = contactForm?.querySelectorAll('input, select, textarea');
    inputs?.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            updateFormStep();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateFormStep();
    }
}

function updateFormStep() {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    currentStepElement?.classList.add('active');

    // Update navigation buttons
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
    
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }

    // Update progress bar
    const progressFill = document.querySelector('.form-progress .progress-fill');
    const progressText = document.querySelector('.progress-text');
    const progressPercent = (currentStep / totalSteps) * 100;
    
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
}

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    // Special validation for step 2
    if (currentStep === 2) {
        const urgencyField = document.getElementById('urgency');
        if (urgencyField.value === 'crisis') {
            showMessage('For crisis situations, please call 988 (Suicide & Crisis Lifeline) or 911 immediately.', 'error');
            return false;
        }
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    clearError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }

    // Email validation
    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }

    // Phone validation
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
    }

    // Name validation
    if ((fieldName === 'firstName' || fieldName === 'lastName') && value) {
        if (value.length < 2) {
            errorMessage = 'Name must be at least 2 characters long';
            isValid = false;
        }
    }

    // Consent validation
    if (fieldName === 'consent' && field.type === 'checkbox') {
        if (!field.checked) {
            errorMessage = 'You must provide consent to continue';
            isValid = false;
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }

    // Collect form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Collect multiple checkboxes
    const concerns = Array.from(document.querySelectorAll('input[name="concerns"]:checked'))
        .map(cb => cb.value);
    data.concerns = concerns;

    // Simulate form submission
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
    submitBtn.disabled = true;

    setTimeout(() => {
        showMessage('Your request has been submitted successfully! A mental health professional will contact you within 24-48 hours.', 'success');
        
        // Reset form
        e.target.reset();
        currentStep = 1;
        updateFormStep();
        
        submitBtn.innerHTML = 'Submit Request';
        submitBtn.disabled = false;
        
        // Scroll to top of contact section
        scrollToSection('contact');
    }, 2000);
}

// Utility Functions
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = `
        <span>${getMessageIcon(type)}</span>
        <span>${message}</span>
    `;

    // Insert at the top of the current section
    const activeSection = document.querySelector('.form-step.active') || 
                         document.querySelector('#tracker .mood-input-section') ||
                         document.querySelector('.hero-container');
    
    if (activeSection) {
        activeSection.insertBefore(messageElement, activeSection.firstChild);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

function getMessageIcon(type) {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        default: return 'ℹ️';
    }
}

// Add some sample data for demonstration
function addSampleData() {
    // Only add if no existing data
    if (moodData.length === 0) {
        const sampleMoods = [
            {
                date: new Date(Date.now() - 86400000).toDateString(),
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                mood: { value: 4, label: 'Good' },
                factors: ['work', 'exercise'],
                notes: 'Had a productive day at work and went for a run.'
            },
            {
                date: new Date(Date.now() - 172800000).toDateString(),
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                mood: { value: 3, label: 'Okay' },
                factors: ['sleep', 'relationships'],
                notes: 'Didn\'t sleep well but had a nice conversation with a friend.'
            }
        ];
        
        moodData.push(...sampleMoods);
        localStorage.setItem('moodData', JSON.stringify(moodData));
    }

    if (goalsData.length === 0) {
        const sampleGoals = [
            {
                id: Date.now() - 1000,
                title: 'Meditate for 10 minutes daily',
                category: 'mindfulness',
                target: 7,
                progress: 3,
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() - 2000,
                title: 'Take a 30-minute walk',
                category: 'exercise',
                target: 5,
                progress: 5,
                completed: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        goalsData.push(...sampleGoals);
        localStorage.setItem('goalsData', JSON.stringify(goalsData));
    }
}

// Initialize sample data
setTimeout(addSampleData, 1000);