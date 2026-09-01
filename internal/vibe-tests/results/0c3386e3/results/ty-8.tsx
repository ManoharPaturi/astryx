export default function ProfileCard() {
  return (
    <div style={{padding: 24, maxWidth: 400, margin: '0 auto'}}>
      <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 8}}>
        <h3 style={{margin: 0, fontSize: 20, fontWeight: 600}}>Sarah Chen</h3>
        <p style={{margin: 0, fontSize: 14, fontWeight: 500, color: '#666'}}>Senior Product Designer</p>
        <p style={{margin: 0, fontSize: 14, lineHeight: 1.6}}>
          Passionate about crafting intuitive user experiences that bridge the gap
          between complex systems and everyday users. 8 years of experience
          in design systems, interaction design, and user research.
        </p>
        <p style={{margin: 0, fontSize: 12, color: '#999'}}>Joined March 2022</p>
      </div>
    </div>
  );
}
