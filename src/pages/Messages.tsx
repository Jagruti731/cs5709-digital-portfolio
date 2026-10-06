import { Chat } from '../components/Chat';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { profile } from '../data/profile';

export default function Messages() {
  return (
    <>
      <PageHeader
        title="Messages"
        crumb="Messages"
        intro="Ask me something and get an instant answer, or chat live with other visitors who have the site open."
      />
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
                    <a href={profile.linkedin}>{profile.linkedinLabel}</a>
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
