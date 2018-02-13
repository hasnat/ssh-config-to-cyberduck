const SSHConfig = require('ssh-config');
const fs = require('fs');
const plist = require('plist');
const os = require('os');
// const uuidv5 = require('uuid/v5');

let sshConfigPath = os.homedir() + '/.ssh/config';

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
        // const UUID = uuidv5(Host, uuidv5.DNS);
        fs.writeFile(
            `./ducks/${Host}.duck`,
            plist.build({
                Protocol: 'sftp',
                Provider: 'iterate GmbH',
                Nickname: Host,
                // UUID,
                Hostname: HostName ? HostName : Host,
                Port: Port ? Port : '22',
                Username: User ? User : os.userInfo().username,
                ...(IdentityFile && IdentityFile.length ? {
                    'Private Key File': IdentityFile[0],
                    'Private Key File Dictionary': {
                        Path: IdentityFile[0]
                    }
                } : {}),
                // Comment: JSON.stringify(config)
            }),
            e => e && console.log(e)
        );
    }
});

