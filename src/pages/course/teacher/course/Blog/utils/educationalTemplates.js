// Enhanced educational templates with images and videos

const educationalTemplates = [
  {
    name: "Concept Explainer",
    html: `
  <div class="edu-template concept-intro" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f8fafc;">
    <h2 style="color: #3b82f6; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Understanding [Concept Name]</h2>
    
    <p style="margin-bottom: 15px; line-height: 1.6;">[Start with an engaging introduction to the concept. Explain why it's important and relevant to students. Make it interesting and approachable.]</p>
    
    <img src="https://placehold.co/600x400?text=Concept+Visual" alt="Concept visual representation" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;">
    
    <div class="learning-objectives" style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
      <h3 style="font-size: 1.2em; color: #1e40af; margin-bottom: 10px;">Learning Objectives</h3>
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li>Understand the basic definition of [concept]</li>
        <li>Identify key characteristics of [concept]</li>
        <li>Apply [concept] in simple contexts</li>
      </ul>
    </div>
    
    <div class="key-concepts" style="margin-bottom: 15px;">
      <h3 style="font-size: 1.2em; color: #4b5563; margin-bottom: 10px;">Key Concepts</h3>
      <p style="margin-bottom: 15px; line-height: 1.6;">[Provide a clear, concise explanation of the main concept. Use simple language and relatable examples.]</p>
      <p style="margin-bottom: 15px; line-height: 1.6;">[Add a second paragraph that explores the concept further or addresses common misconceptions.]</p>
      
      <div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
        <iframe 
          src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          frameborder="0" 
          allowfullscreen>
        </iframe>
      </div>
      
      <p style="margin-top: 15px; line-height: 1.6;">[After the video, add some text explaining how the video relates to the concept being taught. Connect it back to your main points.]</p>
    </div>
    
    <div class="examples" style="margin-bottom: 20px;">
      <h3 style="font-size: 1.2em; color: #4b5563; margin-bottom: 10px;">Examples in Real Life</h3>
      
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin: 20px 0;">
        <div style="flex: 0 0 48%; margin-bottom: 15px;">
          <img src="https://placehold.co/400x300?text=Example+1" alt="Example 1" style="max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 10px;">
          <p style="font-weight: bold;">Example 1: [Brief title]</p>
          <p style="line-height: 1.5;">[Explain how this example demonstrates the concept]</p>
        </div>
        <div style="flex: 0 0 48%; margin-bottom: 15px;">
          <img src="https://placehold.co/400x300?text=Example+2" alt="Example 2" style="max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 10px;">
          <p style="font-weight: bold;">Example 2: [Brief title]</p>
          <p style="line-height: 1.5;">[Explain how this example demonstrates the concept]</p>
        </div>
      </div>
    </div>
    
    <div class="summary" style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #22c55e;">
      <h3 style="font-size: 1.2em; color: #166534; margin-bottom: 10px;">Summary</h3>
      <p style="line-height: 1.6;">[Summarize the key points about the concept. Reinforce the main ideas that students should remember. Keep it concise but comprehensive.]</p>
    </div>
  </div>
      `,
  },
  {
    name: "Tutorial Guide",
    html: `
  <div class="edu-template tutorial" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f8fafc;">
    <h2 style="color: #8b5cf6; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">How to [Accomplish Task/Skill]</h2>
    
    <p style="margin-bottom: 15px; line-height: 1.6;">[Start with a brief introduction to what students will learn and why it's valuable. Set clear expectations about outcomes.]</p>
    
    <div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
      <iframe 
        src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        frameborder="0" 
        allowfullscreen>
      </iframe>
    </div>
    
    <p style="margin: 15px 0; line-height: 1.6;">[Add context to the video above. Explain what students should pay particular attention to in the demonstration.]</p>
    
    <div class="materials" style="background-color: #f5f3ff; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #8b5cf6;">
      <h3 style="font-size: 1.2em; color: #5b21b6; margin-bottom: 10px;">What You'll Need</h3>
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li>[List required materials/tools]</li>
        <li>[List required software/accounts]</li>
        <li>[List pre-requisite knowledge]</li>
      </ul>
    </div>
    
    <div class="steps" style="margin-bottom: 20px;">
      <h3 style="font-size: 1.2em; color: #4b5563; margin-bottom: 15px;">Step-by-Step Instructions</h3>
      
      <div class="step" style="margin-bottom: 25px;">
        <h4 style="font-size: 1.1em; color: #6d28d9; margin-bottom: 10px;">Step 1: [First step title]</h4>
        <img src="https://placehold.co/800x400?text=Step+1+Image" alt="Step 1 illustration" style="max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 10px;">
        <p style="line-height: 1.6;">[Detailed explanation of what to do in this step. Be specific and clear. Mention any potential issues to watch out for.]</p>
        <p style="line-height: 1.6;">[Additional details or tips for this step if needed.]</p>
      </div>
      
      <div class="step" style="margin-bottom: 25px;">
        <h4 style="font-size: 1.1em; color: #6d28d9; margin-bottom: 10px;">Step 2: [Second step title]</h4>
        <img src="https://placehold.co/800x400?text=Step+2+Image" alt="Step 2 illustration" style="max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 10px;">
        <p style="line-height: 1.6;">[Detailed explanation of what to do in this step. Be specific and clear. Mention any potential issues to watch out for.]</p>
        <p style="line-height: 1.6;">[Additional details or tips for this step if needed.]</p>
      </div>
      
      <div class="step" style="margin-bottom: 25px;">
        <h4 style="font-size: 1.1em; color: #6d28d9; margin-bottom: 10px;">Step 3: [Third step title]</h4>
        <img src="https://placehold.co/800x400?text=Step+3+Image" alt="Step 3 illustration" style="max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 10px;">
        <p style="line-height: 1.6;">[Detailed explanation of what to do in this step. Be specific and clear. Mention any potential issues to watch out for.]</p>
        <p style="line-height: 1.6;">[Additional details or tips for this step if needed.]</p>
      </div>
    </div>
    
    <div class="common-mistakes" style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #ef4444;">
      <h3 style="font-size: 1.2em; color: #b91c1c; margin-bottom: 10px;">Common Mistakes to Avoid</h3>
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li><strong>[Mistake 1]:</strong> [Explanation and how to avoid it]</li>
        <li><strong>[Mistake 2]:</strong> [Explanation and how to avoid it]</li>
        <li><strong>[Mistake 3]:</strong> [Explanation and how to avoid it]</li>
      </ul>
    </div>
    
    <div class="final-result" style="margin: 20px 0;">
      <h3 style="font-size: 1.2em; color: #4b5563; margin-bottom: 10px;">Final Result</h3>
      <img src="https://placehold.co/800x400?text=Final+Result" alt="Final result" style="max-width: 100%; height: auto; border-radius: 6px; margin-bottom: 10px;">
      <p style="line-height: 1.6;">[Description of what the finished product/result should look like. Point out important details to notice.]</p>
    </div>
    
    <div class="next-steps" style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
      <h3 style="font-size: 1.2em; color: #065f46; margin-bottom: 10px;">Next Steps</h3>
      <p style="line-height: 1.6;">[Suggest ways to build upon what was learned. Provide ideas for extending or practicing the skill.]</p>
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li>[Additional project idea]</li>
        <li>[Related skill to learn next]</li>
        <li>[Way to apply this in a different context]</li>
      </ul>
    </div>
  </div>
      `,
  },
  {
    name: "Topic Explorer",
    html: `
  <div class="edu-template topic-explorer" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f8fafc;">
    <h2 style="color: #f59e0b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Exploring [Topic Name]</h2>
    
    <div style="display: flex; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 300px; margin-right: 20px; margin-bottom: 15px;">
        <p style="margin-bottom: 15px; line-height: 1.6;">[Begin with an engaging introduction to the topic. Make it captivating and relevant. Explain why this topic matters in the real world and to the students personally.]</p>
        <p style="margin-bottom: 15px; line-height: 1.6;">[Add a second paragraph going deeper into the historical context or background of the topic. This helps students understand how it fits into the broader field of study.]</p>
      </div>
      <img src="https://placehold.co/500x300?text=Topic+Overview" alt="Topic visual overview" style="max-width: 100%; height: auto; border-radius: 8px; flex: 1; min-width: 300px;">
    </div>
    
    <div class="key-questions" style="background-color: #fffbeb; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h3 style="font-size: 1.2em; color: #92400e; margin-bottom: 10px;">Key Questions We'll Explore</h3>
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li>[Question 1 about the topic]</li>
        <li>[Question 2 about the topic]</li>
        <li>[Question 3 about the topic]</li>
        <li>[Question 4 about the topic]</li>
      </ul>
    </div>
    
    <div class="section" style="margin-bottom: 30px;">
      <h3 style="font-size: 1.3em; color: #f59e0b; border-bottom: 1px solid #f59e0b; padding-bottom: 5px; margin-bottom: 15px;">[First Major Aspect of the Topic]</h3>
      <p style="margin-bottom: 15px; line-height: 1.6;">[In-depth exploration of this aspect of the topic. Use rich descriptions and connect to real-world examples when possible.]</p>
      <p style="margin-bottom: 15px; line-height: 1.6;">[Additional paragraph going deeper into this aspect. Include facts, figures, or interesting details that make the content come alive.]</p>
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin: 20px 0;">
        <img src="https://placehold.co/450x300?text=Aspect+1+Image" alt="First aspect illustration" style="max-width: 48%; height: auto; border-radius: 6px; margin-bottom: 10px;">
        <img src="https://placehold.co/450x300?text=Aspect+1+Example" alt="First aspect example" style="max-width: 48%; height: auto; border-radius: 6px; margin-bottom: 10px;">
      </div>
      <p style="margin-top: 15px; line-height: 1.6;">[Concluding thoughts on this aspect of the topic, tying it back to the main theme.]</p>
    </div>
    
    <div class="section" style="margin-bottom: 30px;">
      <h3 style="font-size: 1.3em; color: #f59e0b; border-bottom: 1px solid #f59e0b; padding-bottom: 5px; margin-bottom: 15px;">[Second Major Aspect of the Topic]</h3>
      <p style="margin-bottom: 15px; line-height: 1.6;">[In-depth exploration of this aspect of the topic. Use rich descriptions and connect to real-world examples when possible.]</p>
      
      <div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
        <iframe 
          src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          frameborder="0" 
          allowfullscreen>
        </iframe>
      </div>
      
      <p style="margin-top: 15px; line-height: 1.6;">[Discussion of how the video relates to this aspect of the topic. Add context and highlight key moments in the video that students should notice.]</p>
      <p style="margin-top: 15px; line-height: 1.6;">[Additional insights about this aspect of the topic, perhaps addressing common questions or misconceptions.]</p>
    </div>
    
    <div class="section" style="margin-bottom: 30px;">
      <h3 style="font-size: 1.3em; color: #f59e0b; border-bottom: 1px solid #f59e0b; padding-bottom: 5px; margin-bottom: 15px;">[Third Major Aspect of the Topic]</h3>
      <p style="margin-bottom: 15px; line-height: 1.6;">[In-depth exploration of this aspect of the topic. Use rich descriptions and connect to real-world examples when possible.]</p>
      <p style="margin-bottom: 15px; line-height: 1.6;">[Additional paragraph going deeper into this aspect. Include facts, figures, or interesting details that make the content come alive.]</p>
      <img src="https://placehold.co/800x400?text=Aspect+3+Illustration" alt="Third aspect illustration" style="max-width: 100%; height: auto; border-radius: 6px; margin: 15px 0;">
      <p style="margin-top: 15px; line-height: 1.6;">[Concluding thoughts on this aspect of the topic, tying it back to the main theme.]</p>
    </div>
    
    <div class="real-world-applications" style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
      <h3 style="font-size: 1.2em; color: #0369a1; margin-bottom: 10px;">Real-World Applications</h3>
      <p style="margin-bottom: 10px; line-height: 1.6;">[Explain how this topic applies to real-world situations, careers, or everyday life. Make connections that students can relate to.]</p>
      <ul style="padding-left: 20px; line-height: 1.6;">
        <li><strong>[Application 1]:</strong> [Brief description]</li>
        <li><strong>[Application 2]:</strong> [Brief description]</li>
        <li><strong>[Application 3]:</strong> [Brief description]</li>
      </ul>
    </div>
    
    <div class="conclusion" style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #22c55e;">
      <h3 style="font-size: 1.2em; color: #166534; margin-bottom: 10px;">Conclusion</h3>
      <p style="line-height: 1.6;">[Summarize the key ideas explored in this topic. Connect back to the questions posed at the beginning and show how they've been answered.]</p>
      <p style="line-height: 1.6; margin-top: 10px;">[Final thoughts or reflection questions to leave students with continued interest in the topic.]</p>
    </div>
  </div>
      `,
  },
];

export default educationalTemplates;
