/**
 * @file Messages page: instant messaging (features/chat) and other ways to get in touch.
 */
import { Chat } from '../features/chat/Chat';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { SITE } from '../config/site';

export default function Messages() {
  return (
    <>
      <PageHeader title="Contact" crumb="Contact" intro="Ask a question and get an instant answer, or reach me on LinkedIn." />
      <Section>
        <div className="messages-layout">
          <Chat />
          <aside className="panel">
            <h3>Other ways to reach me</h3>
            <table className="facts-table">
              <tbody>
                <tr>
                  <th scope="row">LinkedIn</th>
                  <td>
                    <a href={SITE.linkedin}>{SITE.linkedin.replace('https://', '')}</a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Based in</th>
                  <td>Limerick, Ireland</td>
                </tr>
                <tr>
                  <th scope="row">From</th>
                  <td>Nashik, India</td>
                </tr>
              </tbody>
            </table>
          </aside>
        </div>
      </Section>
    </>
  );
}
