// Publishes build/ to the gh-pages branch.
// The starter searched only for Windows git.exe paths; the gh-pages package
// uses whatever git is on the PATH, so this works on Windows, macOS and Linux.
import ghpages from 'gh-pages';

ghpages.publish('build', { dotfiles: true }, (err) => {
  if (err) {
    console.error('Deploy failed:', err.message);
    process.exit(1);
  }
  console.log('Published build/ to the gh-pages branch.');
});
