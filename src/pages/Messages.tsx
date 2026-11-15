/**
 * @file Messages ("Contact") page: instant messaging (features/chat) and a LinkedIn button.
 * CR-33: one clean page; the contact table was removed because About already has those facts.
 */
import { Chat } from '../features/chat/Chat';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { SITE } from '../config/site';

export default function Messages() {
  return (
    <>
      <PageHeader
        title="Contact"
        crumb="Contact"
        intro="Ask a question and get an instant answer, chat with other visitors, or reach me on LinkedIn."
      />
      <Section>
        <div className="contact-actions">
          <a className="btn" href={SITE.linkedin} target="_blank" rel="noopener">
            Message me on LinkedIn
          </a>
          <span className="note">Based in Limerick, Ireland</span>
        </div>
        <Chat />
      </Section>
    </>
  );
}
