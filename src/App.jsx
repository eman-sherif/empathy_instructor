import { useState } from 'react'

function App() {
  const phrases = [
    "I'm struggling to keep up with the coursework and feel like I'm falling behind everyone else. I don't know how to ask for help without feeling embarrassed.",
    "I have a learning disability that makes working on programming assignments really difficult. I haven't told my peers because I'm worried it will change how people see me.",
    "I'm dealing with a family emergency at home and I can't focus during class. I'm afraid my grades will drop and I'll lose my scholarship.",
    "I feel like I don't belong in this class — everyone else seems so confident and I wonder if I'm smart enough to be here.",
    "I'm working two jobs to pay for school and I'm exhausted. I miss some classes and I'm terrified to tell my instructor why."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [instructorResponse, setInstructorResponse] = useState('');
  const [claudeRewrite, setClaudeRewrite] = useState('');
  const [editedRewrite, setEditedRewrite] = useState('');
  const [choice, setChoice] = useState(null); // 'original' | 'claude' | 'edit'
  const [policy, setPolicy] = useState('');
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(false);

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInstructorResponse('');
      setClaudeRewrite('');
      setEditedRewrite('');
      setChoice(null);
      setPolicy('');
    }
  };

  const handleSubmit = async () => {
    if (!instructorResponse.trim()) return;
    setLoadingRewrite(true);
    setClaudeRewrite('');
    setChoice(null);
    setPolicy('');

    try {
      const res = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a computer science professor for a large computing course at the University of Washington. You need to respond to student reponses in a empathetic way.\n\nA student has expressed this need:\n"${phrases[currentIndex]}"\n\nAn instructor wrote this response:\n"${instructorResponse}"\n\nRewrite the instructor's response to be more empathetic, warm, and validating. Keep the same core message but make the student feel truly heard and supported. Return only the rewritten response, no preamble. Make the responses a similar length to the instructor's response`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === 'text')?.text || '';
      setClaudeRewrite(text);
      setEditedRewrite(text);
    } catch (e) {
      setClaudeRewrite('Error reaching Claude. Please try again.');
    }
    setLoadingRewrite(false);
  };

  const handleGeneratePolicy = async () => {
    let finalResponse = '';
    if (choice === 'original') finalResponse = instructorResponse;
    else if (choice === 'claude') finalResponse = claudeRewrite;
    else if (choice === 'edit') finalResponse = editedRewrite;
    if (!finalResponse.trim()) return;

    setLoadingPolicy(true);
    setPolicy('');

    const sourceLabel = choice === 'original'
      ? "instructor's original response"
      : choice === 'claude'
        ? "Claude's empathetic rewrite"
        : "an edited version of Claude's rewrite";

    try {
      const res = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a computing professor for a large programming course at the University of Washington. Based on the following context, write a clear, compassionate policy that would support students with similar needs.\n\nStudent need:\n"${phrases[currentIndex]}"\n\nWrite a short, practical policy (1-2 sentences) that:\n1. Outlines the instructor's responsibilities\n2. Describes support resources available\n3. Sets a tone of inclusion and psychological safety\n\nWrite in formal but warm policy language. Return only the policy text, no headings or preamble.`
          }]
        })
      });
      const data = await res.json();
      setPolicy(data.content?.find(b => b.type === 'text')?.text || '');
    } catch (e) {
      setPolicy('Error generating policy. Please try again.');
    }
    setLoadingPolicy(false);
  };

  const btnStyle = {
    padding: '8px 18px',
    cursor: 'pointer',
    borderRadius: '6px',
    border: '1px solid #ccc',
    background: '#fff',
    fontSize: '14px',
  };

  const activeBtnStyle = {
    ...btnStyle,
    border: '2px solid #3b82f6',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: '600',
  };

  return (
    <div>

      {/* SECTION 1: Student Need */}
      <section style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '10px' }}>Student Need</h1>
        <textarea
          readOnly
          value={phrases[currentIndex]}
          style={{
            width: '100%',
            minHeight: '90px',
            padding: '12px',
            fontSize: '15px',
            lineHeight: '1.6',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: '#f9fafb',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>{currentIndex + 1} of {phrases.length}</span>
          <button onClick={handleNext} disabled={currentIndex === phrases.length - 1} style={btnStyle}>
            {currentIndex === phrases.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </section>

      {/* SECTION 2: Instructor Response */}
      <section style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '10px' }}>Instructor response</h1>
        <textarea
          value={instructorResponse}
          onChange={(e) => setInstructorResponse(e.target.value)}
          placeholder="Write your response to this student need…"
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '12px',
            fontSize: '14px',
            lineHeight: '1.6',
            borderRadius: '6px',
            border: '2px solid #3b82f6',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            onClick={handleSubmit}
            disabled={loadingRewrite || !instructorResponse.trim()}
            style={{ ...btnStyle, background: '#3b82f6', color: '#fff', border: 'none' }}
          >
            {loadingRewrite ? 'Rewriting…' : 'Submit for empathy rewrite'}
          </button>
        </div>
      </section>

      {/* SECTION 3: Empathetic Rewrite */}
      {(claudeRewrite || loadingRewrite) && (
        <section style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '10px' }}>Empathetic rewrite</h1>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '14px',
            fontSize: '14px',
            lineHeight: '1.7',
            minHeight: '80px',
            color: '#14532d',
          }}>
            {loadingRewrite ? 'Generating empathetic rewrite…' : claudeRewrite}
          </div>

          {/* Instructor Response */}
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Which response would you like to use?</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setChoice('original')}
                style={choice === 'original' ? activeBtnStyle : btnStyle}
              >
                Use my response
              </button>
              <button
                onClick={() => setChoice('claude')}
                style={choice === 'claude' ? activeBtnStyle : btnStyle}
              >
                Use Claude's rewrite
              </button>
              <button
                onClick={() => setChoice('edit')}
                style={choice === 'edit' ? activeBtnStyle : btnStyle}
              >
                Edit Claude's rewrite
              </button>
            </div>

            {choice === 'edit' && (
              <textarea
                value={editedRewrite}
                onChange={(e) => setEditedRewrite(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '130px',
                  marginTop: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  borderRadius: '6px',
                  border: '1px solid #93c5fd',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {choice && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={handleGeneratePolicy}
                  disabled={loadingPolicy}
                  style={{ ...btnStyle, background: '#7c3aed', color: '#fff', border: 'none' }}
                >
                  {loadingPolicy ? 'Generating policy…' : 'Generate policy →'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 4: Policy */}
      {policy && (
        <section>
          <h1 style={{ fontSize: '20px', marginBottom: '10px' }}>Generated policy</h1>
          <div style={{
            background: '#faf5ff',
            border: '1px solid #d8b4fe',
            borderLeft: '4px solid #7c3aed',
            borderRadius: '0 6px 6px 0',
            padding: '16px',
            fontSize: '14px',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            color: '#3b0764',
          }}>
            {policy}
          </div>
        </section>
      )}

    </div>
  );
}

export default App
