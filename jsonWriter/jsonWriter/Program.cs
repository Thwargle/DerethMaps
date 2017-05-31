using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using PlayerProperties = System.Collections.Generic.Dictionary<string, object>;

namespace jsonWriter
{
    class Program
    {
        private class PlayerInfo { public double xv; public double yv; }
        private Random _rand = new Random();
        private Dictionary<string, PlayerInfo> _playerInfos = new Dictionary<string, PlayerInfo>();
        private int _iteration = 0;
        static void Main(string[] args)
        {
            Program program = new Program();
            for (int i=0; i<10000; ++i)
            {
                program.ProcessAll();
                System.Threading.Thread.Sleep(1000);
            }
        }
        private void ProcessAll()
        {
            string objectsFilepath = "..\\..\\..\\..\\dynamicCoords.json";
            if (!File.Exists(objectsFilepath)) { throw new Exception("File not found: " + objectsFilepath); }
            string text = File.ReadAllText(objectsFilepath);
            object obj = Procurios.Public.JSON.JsonDecode(text);
            if (!(obj is ArrayList)) { throw new Exception("Parse failed"); }
            var arr = (obj as ArrayList);
            foreach (var player in EnumPlayers(arr))
            {
                ProcessPlayer(player);
            }
            string output = Procurios.Public.JSON.JsonEncode(arr);
            File.WriteAllText(objectsFilepath, output);
            ++_iteration;
        }
        private void ProcessPlayer(PlayerProperties player)
        {
            string name = player["LocationName"].ToString();
            PlayerInfo info = new PlayerInfo();
            if (_playerInfos.ContainsKey(name))
            {
                info = _playerInfos[name];
            }
            info.xv = Wobble(info.xv, 1, 4, -4);
            info.yv = Wobble(info.yv, 1, 4, -4);
            double x = ParseLoc(player["x"]);
            double y = ParseLoc(player["y"]);
            if (_iteration == 0)
            {
                x = _rand.NextDouble() * 20 - 10 / 2.0;
                y = _rand.NextDouble() * 20 - 10 / 2.0;
            }
            x = Wobble(x, 4, 101, -101) + info.xv;
            player["x"] = StoreLoc(x, "E", "W");
            y = Wobble(y, 4, 101, -101) + info.yv;
            player["y"] = StoreLoc(y, "S", "N");
        }
        private double ParseLoc(object obj)
        {
            string text = obj.ToString();
            int scale = 1;
            if (text.EndsWith("W") || text.EndsWith("N"))
            {
                scale = -1;
            }
            double val = double.Parse(text.Substring(0, text.Length - 1));
            return val * scale;
        }
        private string StoreLoc(double val, string pos, string neg)
        {
            string posneg;
            if (val >= 0.0)
            {
                posneg = pos;
            }
            else
            {
                posneg = neg;
                val = -val;
            }
            return string.Format(System.Globalization.CultureInfo.InstalledUICulture, "{0}{1}", val, posneg);
        }
        private double Wobble(double val, int scale, int max, int min)
        {
            val += _rand.NextDouble() * scale - scale/2.0;

            if (val > 101) { val = 101; }
            if (val < -101) { val = -101; }
            return val;
        }
        private static IEnumerable<PlayerProperties> EnumPlayers(ArrayList allPlayers)
        {
            foreach (var playerobj in allPlayers)
            {
                PlayerProperties property = (playerobj as PlayerProperties);
                yield return property;
            }
        }
    }
}
