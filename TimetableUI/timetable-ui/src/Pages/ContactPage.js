import React, { useState } from 'react';
import '../Css/ContactPage.css'; 

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        alert('Thank you for your message! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="contact-page">
            <div className="container">
                <div className="contact-header">
                    <h1 className="page-title">Contact Us</h1>
                    <p className="page-subtitle">
                        Get in touch with our team for support, questions, or feedback
                    </p>
                </div>

                <div className="contact-content">
                    {/* Contact Information */}
                    <div className="contact-info">
                        <h2>Get In Touch</h2>
                        <p>
                            Have questions about Nexora? We're here to help! 
                            Reach out to our team and we'll get back to you as soon as possible.
                        </p>

                        <div className="contact-methods">
                            <div className="contact-method">
                                <div className="method-icon">📧</div>
                                <div className="method-details">
                                    <h4>Email Us</h4>
                                    <p>support@Nexora.com</p>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">🕒</div>
                                <div className="method-details">
                                    <h4>Response Time</h4>
                                    <p>Within 24 hours</p>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">🌐</div>
                                <div className="method-details">
                                    <h4>Documentation</h4>
                                    <p>Check our docs for quick answers</p>
                                </div>
                            </div>
                        </div>

                        <div className="support-hours">
                            <h4>Support Hours</h4>
                            <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                            <p>Weekend: Emergency support only</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-container">
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email address"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="What is this regarding?"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    placeholder="Please describe your inquiry in detail..."
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>

                {/* FAQ Section */}
                <section className="faq-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>How long does timetable generation take?</h4>
                            <p>Typically 30-60 seconds depending on the size of your institution and data complexity.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What file formats are supported?</h4>
                            <p>We currently support CSV files for both roll call and elective choice data.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Can I modify generated timetables?</h4>
                            <p>Yes, you can regenerate timetables with updated data as needed.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Is there a limit to the number of students?</h4>
                            <p>No, our system can handle institutions of any size.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ContactPage;