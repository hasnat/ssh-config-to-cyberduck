const SSHConfig = require('ssh-config');
const fs = require('fs');
const plist = require('plist');

let sshConfigPath = require('os').homedir() + '/.ssh/config';

if (process.argv.length > 2) {
    sshConfigPath = process.argv[2];
    process.exit();
}

fs.readFile(sshConfigPath, 'utf-8', (err, data) => {
    if (err) {
        console.log(err);
        console.log('Usage: npm start [FILENAME=~/.ssh/config]     e.g. npm start ~/.ssh/config');
        return;
    }
    const configs = SSHConfig.parse(data);
    fs.mkdir('./ducks', f => f);
    for (let i = 0; i < configs.length; i++) {
        const config = configs.compute(configs[i].value);
        const {Host, HostName, Port, User, IdentityFile} = config;
        fs.writeFile(
            `./ducks/${Host}.duck`,
            plist.build({
                Protocol: 'sftp',
                Provider: 'iterate GmbH',
                Nickname: Host,
                Hostname: HostName,
                Port,
                Username: User,
                ...(IdentityFile && IdentityFile.length ? {
                    'Private Key File': IdentityFile[0],
                    'Private Key File Dictionary': {
                        Path: IdentityFile[0]
                    }
                } : {}),
                Comment: JSON.stringify(config)
            }),
            console.log
        );
    }
});

