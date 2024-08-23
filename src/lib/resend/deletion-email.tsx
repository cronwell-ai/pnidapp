import * as React from 'react';

interface EmailTemplateProps {
  userEmail: string;
  userFirstName: string;
  userId: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  userEmail,
  userFirstName,
  userId,
}) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  }}>
    <h1 style={{
      color: '#2c3e50',
      borderBottom: '2px solid #3498db',
      paddingBottom: '10px',
    }}>Account Deletion Request</h1>
    <p>Dear Operator,</p>
    <p>A user has requested to delete their account. Please review the following details:</p>
    <ul style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '5px',
      padding: '15px 25px',
      listStyleType: 'none',
    }}>
      <li style={{ margin: '10px 0' }}><strong>User Email:</strong> {userEmail}</li>
      <li style={{ margin: '10px 0' }}><strong>User First Name:</strong> {userFirstName}</li>
      <li style={{ margin: '10px 0' }}><strong>User ID:</strong> {userId}</li>
    </ul>
    <p>Please take appropriate action to process this account deletion request according to our data retention policies and user privacy guidelines.</p>
    <p>If you need any additional information or clarification, please contact the user directly at <a href={`mailto:${userEmail}`} style={{ color: '#3498db', textDecoration: 'none' }}>{userEmail}</a>.</p>
    <p>Thank you for your attention to this matter.</p>
    <p style={{
      borderTop: '1px solid #e0e0e0',
      paddingTop: '15px',
      marginTop: '20px',
    }}>Best regards,<br />Account Management System</p>
  </div>
);