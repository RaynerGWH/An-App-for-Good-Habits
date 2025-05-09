// Global variables
const API_URL = 'http://localhost:8080/api/habits';
let habits = [];
let notificationHistory = [];

// DOM Elements
const dashboardBtn = document.getElementById('dashboard-btn');
const habitsBtn = document.getElementById('habits-btn');
const settingsBtn = document.getElementById('settings-btn');
const dashboardView = document.getElementById('dashboard-view');
const habitsView = document.getElementById('habits-view');
const settingsView = document.getElementById('settings-view');
const throughoutDayList = document.getElementById('throughout-day-list');
const onceDayList = document.getElementById('once-day-list');
const onceWeekList = document.getElementById('once-week-list');
const notificationHistoryEl = document.getElementById('notification-history');
const addHabitForm = document.getElementById('add-habit-form');
const habitDescription = document.getElementById('habit-description');
const habitFrequency = document.getElementById('habit-frequency');
const allHabitsList = document.getElementById('all-habits-list');
const notificationPopup = document.getElementById('notification-popup');
const notificationHabitText = document.getElementById('notification-habit-text');
const dismissBtn = document.getElementById('dismiss-btn');
const completeBtn = document.getElementById('complete-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    dashboardBtn.addEventListener('click', () => showView(dashboardView));
    habitsBtn.addEventListener('click', () => showView(habitsView));
    settingsBtn.addEventListener('click', () => showView(settingsView));
    
    // Add habit form
    addHabitForm.addEventListener('submit', addHabit);
    
    // Notification actions
    dismissBtn.addEventListener('click', dismissNotification);
    completeBtn.addEventListener('click', completeHabit);
    
    // Load initial data
    loadHabits();
    
    // Check if it's first run
    if (!localStorage.getItem('habitsAppInitialized')) {
        showOnboarding();
    } else {
        // Start notification scheduler
        startNotificationScheduler();
    }
});

// Show the selected view
function showView(view) {
    // Hide all views
    dashboardView.classList.remove('active');
    habitsView.classList.remove('active');
    settingsView.classList.remove('active');
    
    // Remove active class from all buttons
    dashboardBtn.classList.remove('active');
    habitsBtn.classList.remove('active');
    settingsBtn.classList.remove('active');
    
    // Show selected view
    view.classList.add('active');
    
    // Add active class to selected button
    if (view === dashboardView) dashboardBtn.classList.add('active');
    if (view === habitsView) habitsBtn.classList.add('active');
    if (view === settingsView) settingsBtn.classList.add('active');
}

// Load habits from API
async function loadHabits() {
    try {
        const response = await fetch(API_URL);
        habits = await response.json();
        renderHabits();
    } catch (error) {
        console.error('Error loading habits:', error);
        // If API fails, try to load from localStorage as fallback
        const savedHabits = localStorage.getItem('habits');
        if (savedHabits) {
            habits = JSON.parse(savedHabits);
            renderHabits();
        }
    }
}

// Render habits in the UI
function renderHabits() {
    // Clear current lists
    throughoutDayList.innerHTML = '';
    onceDayList.innerHTML = '';
    onceWeekList.innerHTML = '';
    allHabitsList.innerHTML = '';
    
    // Group habits by frequency
    const throughoutDayHabits = habits.filter(h => h.frequency === 'THROUGHOUT_DAY');
    const onceDayHabits = habits.filter(h => h.frequency === 'ONCE_A_DAY');
    const onceWeekHabits = habits.filter(h => h.frequency === 'ONCE_A_WEEK');
    
    // Render habit lists
    throughoutDayHabits.forEach(habit => {
        throughoutDayList.appendChild(createHabitListItem(habit));
    });
    
    onceDayHabits.forEach(habit => {
        onceDayList.appendChild(createHabitListItem(habit));
    });
    
    onceWeekHabits.forEach(habit => {
        onceWeekList.appendChild(createHabitListItem(habit));
    });
    
    // Render all habits list
    habits.forEach(habit => {
        allHabitsList.appendChild(createHabitItemForManagement(habit));
    });
    
    // Save to localStorage as backup
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Create a habit list item
function createHabitListItem(habit) {
    const li = document.createElement('li');
    li.textContent = habit.description;
    return li;
}

// Create a habit item for the management view
function createHabitItemForManagement(habit) {
    const div = document.createElement('div');
    div.className = 'habit-item';
    
    const description = document.createElement('span');
    description.className = 'description';
    description.textContent = habit.description;
    
    const frequency = document.createElement('span');
    frequency.className = 'frequency';
    frequency.textContent = formatFrequency(habit.frequency);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteHabit(habit.id));
    
    div.appendChild(description);
    div.appendChild(frequency);
    div.appendChild(deleteBtn);
    
    return div;
}

// Format frequency for display
function formatFrequency(frequency) {
    switch (frequency) {
        case 'THROUGHOUT_DAY': return 'Throughout the day';
        case 'ONCE_A_DAY': return 'Once a day';
        case 'ONCE_A_WEEK': return 'Once a week';
        default: return frequency;
    }
}

// Add a new habit
async function addHabit(event) {
    event.preventDefault();
    
    if (!habitDescription.value.trim()) {
        alert('Please enter a habit description');
        return;
    }
    
    const newHabit = {
        description: habitDescription.value.trim(),
        frequency: habitFrequency.value,
        completed: false
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newHabit)
        });
        
        const savedHabit = await response.json();
        habits.push(savedHabit);
        renderHabits();
        
        // Clear form
        habitDescription.value = '';
        
        // Show dashboard
        showView(dashboardView);
    } catch (error) {
        console.error('Error adding habit:', error);
        alert('Failed to add habit. Please try again.');
    }
}

// Delete a habit
async function deleteHabit(id) {
    if (!confirm('Are you sure you want to delete this habit?')) {
        return;
    }
    
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        habits = habits.filter(h => h.id !== id);
        renderHabits();
    } catch (error) {
        console.error('Error deleting habit:', error);
        alert('Failed to delete habit. Please try again.');
    }
}

// Show onboarding process
function showOnboarding() {
    // Switch to habits view
    showView(habitsView);
    
    // Mark as initialized after onboarding
    localStorage.setItem('habitsAppInitialized', 'true');
}

// Start notification scheduler
function startNotificationScheduler() {
    // Schedule random notifications based on frequency
    setInterval(() => {
        const randomChance = Math.random();
        
        // Get notification frequency preference
        const notificationFrequency = document.getElementById('notification-frequency').value;
        let threshold;
        
        switch (notificationFrequency) {
            case 'LOW': threshold = 0.95; break;
            case 'MEDIUM': threshold = 0.9; break;
            case 'HIGH': threshold = 0.85; break;
            default: threshold = 0.9;
        }
        
        if (randomChance > threshold) {
            showRandomHabitNotification();
        }
    }, 60000); // Check every minute
}

// Show a random habit notification
function showRandomHabitNotification() {
    if (habits.length === 0) return;
    
    // Select a random habit
    const randomIndex = Math.floor(Math.random() * habits.length);
    const randomHabit = habits[randomIndex];
    
    // Update notification popup
    notificationHabitText.textContent = randomHabit.description;
    notificationPopup.setAttribute('data-habit-id', randomHabit.id);
    
    // Show the notification
    notificationPopup.classList.add('show');
    
    // Hide after 30 seconds if not interacted with
    setTimeout(() => {
        if (notificationPopup.classList.contains('show')) {
            dismissNotification();
        }
    }, 30000);
    
    // Add to notification history
    addNotificationToHistory(randomHabit, 'pending');
}

// Dismiss notification
function dismissNotification() {
    notificationPopup.classList.remove('show');
    
    // Update notification history
    const habitId = notificationPopup.getAttribute('data-habit-id');
    updateNotificationStatus(habitId, 'missed');
}

// Mark habit as completed
function completeHabit() {
    notificationPopup.classList.remove('show');
    
    // Get the habit ID
    const habitId = notificationPopup.getAttribute('data-habit-id');
    const habit = habits.find(h => h.id == habitId);
    
    if (habit) {
        // Update the habit completed status in the API
        updateHabitCompleted(habitId, true);
        
        // Update notification history
        updateNotificationStatus(habitId, 'completed');
    }
}

// Update habit completed status
async function updateHabitCompleted(id, completed) {
    const habit = habits.find(h => h.id == id);
    if (!habit) return;
    
    const updatedHabit = { ...habit, completed };
    
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedHabit)
        });
        
        // Update local data
        const index = habits.findIndex(h => h.id == id);
        if (index !== -1) {
            habits[index].completed = completed;
        }
    } catch (error) {
        console.error('Error updating habit:', error);
    }
}

// Add notification to history
function addNotificationToHistory(habit, status) {
    const notification = {
        id: Date.now(),
        habitId: habit.id,
        habitDescription: habit.description,
        time: new Date(),
        status: status
    };
    
    notificationHistory.unshift(notification);
    
    // Keep only the last 10 notifications
    if (notificationHistory.length > 10) {
        notificationHistory = notificationHistory.slice(0, 10);
    }
    
    renderNotificationHistory();
    
    // Save to localStorage
    localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
}

// Update notification status
function updateNotificationStatus(habitId, status) {
    const notification = notificationHistory.find(n => n.habitId == habitId && n.status === 'pending');
    if (notification) {
        notification.status = status;
        renderNotificationHistory();
        
        // Save to localStorage
        localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
    }
}

// Render notification history
function renderNotificationHistory() {
    notificationHistoryEl.innerHTML = '';
    
    notificationHistory.forEach(notification => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        
        const habitsText = document.createElement('p');
        habitsText.textContent = notification.habitDescription;
        
        const timeText = document.createElement('p');
        timeText.className = 'time';
        timeText.textContent = formatTime(notification.time);
        
        const statusSpan = document.createElement('span');
        statusSpan.className = `status ${notification.status}`;
        statusSpan.textContent = notification.status;
        
        div.appendChild(habitsText);
        div.appendChild(timeText);
        div.appendChild(statusSpan);
        
        notificationHistoryEl.appendChild(div);
    });
}

// Format time for display
function formatTime(timeString) {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}